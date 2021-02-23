import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecr from '@aws-cdk/aws-ecr';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ecs_patterns from '@aws-cdk/aws-ecs-patterns';
import * as iam from '@aws-cdk/aws-iam';
import * as codebuild from '@aws-cdk/aws-codebuild';
import * as codecommit from '@aws-cdk/aws-codecommit';
import * as targets from '@aws-cdk/aws-events-targets';
import * as codedeploy from'@aws-cdk/aws-codedeploy';
import * as codepipeline from'@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import { S3DeployAction } from '@aws-cdk/aws-codepipeline-actions';

export class Ab3CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const bkt = new s3.Bucket(this, 'octankbucket', {
      versioned: true
    });

      /**
     * Create a new VPC with single NAT Gateway
     */
    const vpc = new ec2.Vpc(this, 'octank-vpc', {
      cidr: '10.0.0.0/16',
      natGateways: 1,
      maxAzs: 3
    });

    const clusterAdmin = new iam.Role(this, 'octankadminrole', {
      assumedBy: new iam.AccountRootPrincipal()
    });

    

    //#1  create Cluster
    //#2  create logdriver
    //#3  create a task role 
    //#4  define execution policy 
    //#5  Create Task Defination using task role(#3)
    //#6  assign policy(#4) to task defination
    //#7  add container to task defination 
    //#8  add port mapping to container 
    //#9  Add Service with application load balancer to cluster for specific task
    //#10 Set up autoscalling for the service
    
    const executionRolePolicy =  new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: ['*'],
      actions: [
                "ecr:GetAuthorizationToken",
                "ecr:BatchCheckLayerAvailability",
                "ecr:GetDownloadUrlForLayer",
                "ecr:BatchGetImage",
                "logs:CreateLogStream",
                "logs:PutLogEvents",
                "rds-db:connect"
            ]
    });


    const testcluster = new ecs.Cluster(this, 'octank-test-ecs-cluster', {
      vpc: vpc,
      containerInsights: true,
    });

    const testlogging = new ecs.AwsLogDriver({
      streamPrefix: "octank-test-ecs-logs"
    });

    const testtaskRole = new iam.Role(this, `octank-test-ecs-taskRole-${this.stackName}`, {
      roleName: `octank-test-ecs-taskRole-${this.stackName}`,
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com')
    });

    const testtaskDef = new ecs.FargateTaskDefinition(this, "octank-test-ecs-taskdef", {
      taskRole: testtaskRole
    });

    testtaskDef.addToExecutionRolePolicy(executionRolePolicy);

    const testcontainer = testtaskDef.addContainer('octank-app', {
      image: ecs.ContainerImage.fromRegistry("nikunjv/flask-image:blue"),
      memoryLimitMiB: 256,
      cpu: 256,
      logging: testlogging
    });

    testcontainer.addPortMappings({
      containerPort: 5000,
      protocol: ecs.Protocol.TCP
    });

    const testfargateService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, "octank-test-ecs-service", {
      cluster: testcluster,
      taskDefinition: testtaskDef,
      publicLoadBalancer: true,
      desiredCount: 3,
      listenerPort: 80
    });

    const testscaling = testfargateService.service.autoScaleTaskCount({ maxCapacity: 6 });
    testscaling.scaleOnCpuUtilization('octank-test-CpuScaling', {
      targetUtilizationPercent: 10,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60)
    });











    const cluster = new ecs.Cluster(this, 'octank-ecs-cluster', {
      vpc: vpc,
      containerInsights: true,
    });

    const logging = new ecs.AwsLogDriver({
      streamPrefix: "octank-ecs-logs"
    });
    
    const taskRole = new iam.Role(this, `octank-ecs-taskRole-${this.stackName}`, {
      roleName: `octank-ecs-taskRole-${this.stackName}`,
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com')
    }); 

    const taskDef = new ecs.FargateTaskDefinition(this, "octank-ecs-taskdef", {
      taskRole: taskRole
    });
    
    taskDef.addToExecutionRolePolicy(executionRolePolicy);

    const container = taskDef.addContainer('octank-app', {
      image: ecs.ContainerImage.fromRegistry("nikunjv/flask-image:blue"),
      memoryLimitMiB: 256,
      cpu: 256,
      logging: logging
    });

    
    container.addPortMappings({
      containerPort: 5000,
      protocol: ecs.Protocol.TCP
    });

    
    const fargateService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, "octank-ecs-service", {
      cluster: cluster,
      taskDefinition: taskDef,
      publicLoadBalancer: true,
      desiredCount: 3,
      listenerPort: 80
    });

    
    const scaling = fargateService.service.autoScaleTaskCount({ maxCapacity: 6 });
    scaling.scaleOnCpuUtilization('octank-CpuScaling', {
      targetUtilizationPercent: 10,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60)
    });

    // ***PIPELINE CONSTRUCTS***


    // ECR - repo
    const ecrRepo = new ecr.Repository(this, 'ocktank-ecr-repo');

    const gitHubSource = codebuild.Source.gitHub({
      owner: 'parth2651',
      repo: 'ecs-fargate-cdk-sample',
      webhook: true, // optional, default: true if `webhookFilteres` were provided, false otherwise
      webhookFilters: [
        codebuild.FilterGroup.inEventOf(codebuild.EventAction.PUSH).andBranchIs('main'),
      ], // optional, by default all pushes and Pull Requests will trigger a build
    });

    // CODEBUILD - project
    const project = new codebuild.Project(this, 'octankproject', {
      projectName: `${this.stackName}`,
      source: gitHubSource,
      environment: {
        buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_2,
        privileged: true
      },
      environmentVariables: {
        'CLUSTER_NAME': {
          value: `${cluster.clusterName}`
        },
        'ECR_REPO_URI': {
          value: `${ecrRepo.repositoryUri}`
        }
      },
      buildSpec: codebuild.BuildSpec.fromObject({
        version: "0.2",
        phases: {
          pre_build: {
            commands: [
              'env',
              'export TAG=${CODEBUILD_RESOLVED_SOURCE_VERSION}'
            ]
          },
          build: {
            commands: [
              'cd node-docker-app',
              `docker build -t $ECR_REPO_URI:$TAG .`,
              '$(aws ecr get-login --no-include-email)',
              'docker push $ECR_REPO_URI:$TAG'
            ]
          },
          post_build: {
            commands: [
              'echo "In Post-Build Stage"',
              'cd ..',
              "printf '[{\"name\":\"octank-app\",\"imageUri\":\"%s\"}]' $ECR_REPO_URI:$TAG > imagedefinitions.json",
              "pwd; ls -al; cat imagedefinitions.json"
            ]
          }
        },
        artifacts: {
          files: [
            'imagedefinitions.json'
          ]
        }
      })
    });



    // ***PIPELINE ACTIONS***

    const sourceOutput = new codepipeline.Artifact();
    const buildOutput = new codepipeline.Artifact();

    const sourceAction = new codepipeline_actions.GitHubSourceAction({
      actionName: 'GitHub_Source',
      owner: 'parth2651',
      repo: 'ecs-fargate-cdk-sample',
      branch: 'main',
      oauthToken: cdk.SecretValue.secretsManager("/my/github/token"),
      //oauthToken: cdk.SecretValue.plainText('<plain-text>'),
      output: sourceOutput
    });

    const buildAction = new codepipeline_actions.CodeBuildAction({
      actionName: 'CodeBuild',
      project: project,
      input: sourceOutput,
      outputs: [buildOutput], // optional
    });

    const manualApprovalAction = new codepipeline_actions.ManualApprovalAction({
      actionName: 'Approve',
      additionalInformation: 'Test deployment Comopleted',
      externalEntityLink: testfargateService.loadBalancer.loadBalancerDnsName,
      
    });
    const deploytotestAction = new codepipeline_actions.EcsDeployAction({
      actionName: 'DeployAction',
      service: testfargateService.service,
      imageFile: new codepipeline.ArtifactPath(buildOutput, `imagedefinitions.json`)
    });
    const deployAction = new codepipeline_actions.EcsDeployAction({
      actionName: 'DeployAction',
      service: fargateService.service,
      imageFile: new codepipeline.ArtifactPath(buildOutput, `imagedefinitions.json`)
    });



    // PIPELINE STAGES

    new codepipeline.Pipeline(this, 'ocktabk-ECSPipeline', {
      stages: [
        {
          stageName: 'Source',
          actions: [sourceAction],
        },
        {
          stageName: 'Build',
          actions: [buildAction],
        },
        {
          stageName: 'Deploy-to-Test-ECS',
          actions: [deploytotestAction],
        },
        {
          stageName: 'Production-Deployment-Approval',
          actions: [manualApprovalAction],
        },
        {
          stageName: 'Deploy-to-Production-ECS',
          actions: [deployAction],
        }
      ]
    });


    ecrRepo.grantPullPush(project.role!)
    project.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        "ecs:DescribeCluster",
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:BatchGetImage",
        "ecr:GetDownloadUrlForLayer",
        "rds-db:connect"
        ],
      resources: [`${cluster.clusterArn}`],
    }));

    //OUTPUT

    new cdk.CfnOutput(this, 'TestLoadBalancerDNS', { value: testfargateService.loadBalancer.loadBalancerDnsName });
    new cdk.CfnOutput(this, 'LoadBalancerDNS', { value: fargateService.loadBalancer.loadBalancerDnsName });
  }
}
