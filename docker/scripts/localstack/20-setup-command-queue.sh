#!/bin/bash

echo "[INIT SCRIPT] Creating command queues" >&2

export AWS_REGION=eu-west-2
export AWS_DEFAULT_REGION=eu-west-2

aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name epr_backend_commands_dlq
aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name epr_backend_commands --attributes "{\"RedrivePolicy\":\"{\\\"deadLetterTargetArn\\\":\\\"arn:aws:sqs:eu-west-2:000000000000:epr_backend_commands_dlq\\\",\\\"maxReceiveCount\\\":\\\"3\\\"}\"}"
