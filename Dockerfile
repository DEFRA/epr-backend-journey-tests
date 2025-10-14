FROM zaproxy/zap-stable:latest AS zap-stage

RUN zap.sh -cmd -addoninstall ascanrules
RUN zap.sh -cmd -addoninstall pscanrules

FROM node:22.20.0-alpine3.22

ENV TZ="Europe/London"

USER root

# Copy ZAP from zap stage
COPY --from=zap-stage /zap /zap
COPY --from=zap-stage /home/zap/.ZAP /home/zap/.ZAP

# Set up ZAP environment
ENV ZAP_PATH=/zap
ENV PATH=$ZAP_PATH:$PATH
ENV ZAP_PORT=8080

RUN apk update\
    && apk add \
    curl \
    zip \
    bash \
    openjdk17-jdk

RUN apk add --no-cache aws-cli

WORKDIR /app

COPY . .
RUN npm install --ignore-scripts

EXPOSE 8080

ENTRYPOINT [ "./entrypoint.sh" ]

# This is downloading the linux amd64 aws cli. For M1 macs build and run with the --platform=linux/amd64 argument. eg docker build . --platform=linux/amd64
