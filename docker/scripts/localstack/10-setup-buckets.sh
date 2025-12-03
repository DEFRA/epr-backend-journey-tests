#!/bin/bash

echo "[INIT SCRIPT] Starting LocalStack setup" >&2

export AWS_REGION=eu-west-2
export AWS_DEFAULT_REGION=eu-west-2
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test

echo "[INIT SCRIPT] Creating buckets" >&2

aws --endpoint-url=http://localhost:4566 s3 mb s3://re-ex-summary-logs

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

