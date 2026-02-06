#!/bin/bash

echo "[INIT SCRIPT] Starting LocalStack setup" >&2

export AWS_REGION=eu-west-2
export AWS_DEFAULT_REGION=eu-west-2
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test

echo "[INIT SCRIPT] Creating buckets" >&2

aws --endpoint-url=http://localhost:4566 s3 mb s3://cdp-uploader-quarantine
aws --endpoint-url=http://localhost:4566 s3 mb s3://re-ex-summary-logs
aws --endpoint-url=http://localhost:4566 s3 mb s3://re-ex-public-register

echo "[INIT SCRIPT] Creating queues" >&2

# queues
aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name cdp-clamav-results
aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name cdp-uploader-scan-results-callback.fifo --attributes "{\"FifoQueue\":\"true\",\"ContentBasedDeduplication\": \"true\"}"

# test harness
aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name mock-clamav
aws --endpoint-url=http://localhost:4566 s3api put-bucket-notification-configuration --bucket cdp-uploader-quarantine --notification-configuration '{"QueueConfigurations": [{"QueueArn": "arn:aws:sqs:eu-west-2:000000000000:mock-clamav","Events": ["s3:ObjectCreated:*"]}]}'
aws --endpoint-url=http://localhost:4566 sqs create-queue --region $AWS_REGION --queue-name cdp-uploader-download-requests

echo "[INIT SCRIPT] Uploading spreadsheets to S3 bucket" >&2

aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key test-upload-key \
  --body /etc/localstack/init/ready.d/test-upload.xlsx \
  --endpoint-url=http://localhost:4566 \

aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key valid-summary-log-input-key \
  --body /etc/localstack/init/ready.d/valid-summary-log-input.xlsx \
  --endpoint-url=http://localhost:4566 \

aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key valid-summary-log-input-2-key \
  --body /etc/localstack/init/ready.d/valid-summary-log-input-2.xlsx \
  --endpoint-url=http://localhost:4566 \

aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key invalid-test-upload-key \
  --body /etc/localstack/init/ready.d/invalid-test-upload.xlsx \
  --endpoint-url=http://localhost:4566 \

aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key invalid-row-id-key \
  --body /etc/localstack/init/ready.d/invalid-row-id.xlsx \
  --endpoint-url=http://localhost:4566 \

aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key invalid-table-name-key \
  --body /etc/localstack/init/ready.d/invalid-table-name.xlsx \
  --endpoint-url=http://localhost:4566 \

aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key reprocessor-output-invalid-key \
  --body /etc/localstack/init/ready.d/reprocessor-output-invalid.xlsx \
  --endpoint-url=http://localhost:4566 \

aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key reprocessor-output-valid-key \
  --body /etc/localstack/init/ready.d/reprocessor-output-valid.xlsx \
  --endpoint-url=http://localhost:4566 \

aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key reprocessor-input-invalid-key \
  --body /etc/localstack/init/ready.d/reprocessor-input-invalid.xlsx \
  --endpoint-url=http://localhost:4566 \

aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key reprocessor-input-adjustments-key \
  --body /etc/localstack/init/ready.d/reprocessor-input-adjustments.xlsx \
  --endpoint-url=http://localhost:4566 \

aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key reprocessor-output-adjustments-key \
  --body /etc/localstack/init/ready.d/reprocessor-output-adjustments.xlsx \
  --endpoint-url=http://localhost:4566 \

aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key reprocessor-input-senton-invalid-key \
  --body /etc/localstack/init/ready.d/reprocessor-input-senton-invalid.xlsx \
  --endpoint-url=http://localhost:4566 \

aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key exporter-invalid-key \
  --body /etc/localstack/init/ready.d/exporter-invalid.xlsx \
  --endpoint-url=http://localhost:4566 \

aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key exporter-adjustments-key \
  --body /etc/localstack/init/ready.d/exporter-adjustments.xlsx \
  --endpoint-url=http://localhost:4566 \

aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key exporter-key \
  --body /etc/localstack/init/ready.d/exporter.xlsx \
  --endpoint-url=http://localhost:4566 \

# Staleness test fixtures (reuse valid file with different keys)
aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key staleness-test-file-1-key \
  --body /etc/localstack/init/ready.d/valid-summary-log-input.xlsx \
  --endpoint-url=http://localhost:4566 \

aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key staleness-test-file-2-key \
  --body /etc/localstack/init/ready.d/valid-summary-log-input.xlsx \
  --endpoint-url=http://localhost:4566 \
