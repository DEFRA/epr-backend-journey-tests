#!/bin/bash

echo "[INIT SCRIPT] Creating backend command queue" >&2

export AWS_REGION=eu-west-2
export AWS_DEFAULT_REGION=eu-west-2
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test

aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name epr_backend_commands_dlq
aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name epr_backend_commands --attributes "{\"RedrivePolicy\":\"{\\\"deadLetterTargetArn\\\":\\\"arn:aws:sqs:eu-west-2:000000000000:epr_backend_commands_dlq\\\",\\\"maxReceiveCount\\\":\\\"3\\\"}\"}"

echo "[INIT SCRIPT] Backend command queue created" >&2
