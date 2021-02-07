#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Ab3CdkStack } from '../lib/ab3_cdk-stack';

const app = new cdk.App();
new Ab3CdkStack(app, 'Ab3CdkStack');
