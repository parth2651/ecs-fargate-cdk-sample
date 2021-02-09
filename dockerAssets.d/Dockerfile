FROM alpine:latest


RUN \
	mkdir /root/bin /aws; \
	apk -Uuv add groff less bash python py-pip jq curl docker && \
	pip install --upgrade pip; \
	pip install awscli && \
	apk --purge -v del py-pip && \
	rm /var/cache/apk/* && \


WORKDIR $HOME

COPY entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod a+x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
