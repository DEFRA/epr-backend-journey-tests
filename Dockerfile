FROM zaproxy/zap-stable:latest AS zap-stage

RUN zap.sh -cmd -addoninstall ascanrules
RUN zap.sh -cmd -addoninstall pscanrules

FROM node:22.13.1-slim

ENV TZ="Europe/London"

USER root

# Copy ZAP from zap stage
COPY --from=zap-stage /zap /zap
COPY --from=zap-stage /home/zap/.ZAP /home/zap/.ZAP

# Set up ZAP environment
ENV ZAP_PATH=/zap
ENV PATH=$ZAP_PATH:$PATH
ENV ZAP_PORT=8080

RUN apt-get update -qq \
    && apt-get install -qqy \
    curl \
    zip \
    openjdk-17-jre-headless

RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && ./aws/install

WORKDIR /app

COPY . .
RUN npm install

EXPOSE 8080

ENTRYPOINT [ "./entrypoint.sh" ]

# This is downloading the linux amd64 aws cli. For M1 macs build and run with the --platform=linux/amd64 argument. eg docker build . --platform=linux/amd64
