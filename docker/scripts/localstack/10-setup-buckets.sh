#!/bin/bash

# This is an example of how to setup localstack resources on startup.
# Uncomment the below to create a localstack S3 bucket called 'example-bucket'

# aws --endpoint-url=$LOCALSTACK_URL s3 --region $AWS_REGION mb s3://example-bucket
