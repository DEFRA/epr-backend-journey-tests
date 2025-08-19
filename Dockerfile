FROM node:22.13.1-slim

ENV TZ="Europe/London"

USER root

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

ENTRYPOINT [ "./entrypoint.sh" ]

# This is downloading the linux amd64 aws cli. For M1 macs build and run with the --platform=linux/amd64 argument. eg docker build . --platform=linux/amd64
