FROM node:24.17.0-alpine@sha256:156b55f92e98ccd5ef49578a8cea0df4679826564bad1c9d4ef04462b9f0ded6

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
