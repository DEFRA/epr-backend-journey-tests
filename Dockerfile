FROM node:22.22.0-alpine3.22

ENV TZ="Europe/London"

USER root

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
