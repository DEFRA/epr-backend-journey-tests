#!/bin/bash

echo "[INIT SCRIPT] Uploading spreadsheets to S3 bucket" >&2

aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key test-upload-key \
  --body /etc/localstack/init/ready.d/summarylogs/test-upload.xlsx \
  --endpoint-url=http://localhost:4566 \

aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key valid-summary-log-input-key \
  --body /etc/localstack/init/ready.d/summarylogs/valid-summary-log-input.xlsx \
  --endpoint-url=http://localhost:4566 \

aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key valid-summary-log-input-2-key \
  --body /etc/localstack/init/ready.d/summarylogs/valid-summary-log-input-2.xlsx \
  --endpoint-url=http://localhost:4566 \

aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key invalid-test-upload-key \
  --body /etc/localstack/init/ready.d/summarylogs/invalid-test-upload.xlsx \
  --endpoint-url=http://localhost:4566 \

aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key invalid-row-id-key \
  --body /etc/localstack/init/ready.d/summarylogs/invalid-row-id.xlsx \
  --endpoint-url=http://localhost:4566 \

aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key invalid-table-name-key \
  --body /etc/localstack/init/ready.d/summarylogs/invalid-table-name.xlsx \
  --endpoint-url=http://localhost:4566 \

aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key reprocessor-output-invalid-key \
  --body /etc/localstack/init/ready.d/summarylogs/reprocessor-output-invalid.xlsx \
  --endpoint-url=http://localhost:4566 \

aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key reprocessor-output-valid-key \
  --body /etc/localstack/init/ready.d/summarylogs/reprocessor-output-valid.xlsx \
  --endpoint-url=http://localhost:4566 \

aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key reprocessor-input-invalid-key \
  --body /etc/localstack/init/ready.d/summarylogs/reprocessor-input-invalid.xlsx \
  --endpoint-url=http://localhost:4566 \

aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key reprocessor-input-valid-key \
  --body /etc/localstack/init/ready.d/summarylogs/reprocessor-input-valid.xlsx \
  --endpoint-url=http://localhost:4566 \

aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key reprocessor-input-adjustments-key \
  --body /etc/localstack/init/ready.d/summarylogs/reprocessor-input-adjustments.xlsx \
  --endpoint-url=http://localhost:4566 \

aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key reprocessor-output-adjustments-key \
  --body /etc/localstack/init/ready.d/summarylogs/reprocessor-output-adjustments.xlsx \
  --endpoint-url=http://localhost:4566 \

aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key reprocessor-input-senton-invalid-key \
  --body /etc/localstack/init/ready.d/summarylogs/reprocessor-input-senton-invalid.xlsx \
  --endpoint-url=http://localhost:4566 \

aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key exporter-invalid-key \
  --body /etc/localstack/init/ready.d/summarylogs/exporter-invalid.xlsx \
  --endpoint-url=http://localhost:4566 \

aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key exporter-adjustments-key \
  --body /etc/localstack/init/ready.d/summarylogs/exporter-adjustments.xlsx \
  --endpoint-url=http://localhost:4566 \

aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key exporter-key \
  --body /etc/localstack/init/ready.d/summarylogs/exporter.xlsx \
  --endpoint-url=http://localhost:4566 \

aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key glass-remelt-input-key \
  --body /etc/localstack/init/ready.d/summarylogs/glass-remelt-input.xlsx \
  --endpoint-url=http://localhost:4566 \

aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key glass-other-output-key \
  --body /etc/localstack/init/ready.d/summarylogs/glass-other-output.xlsx \
  --endpoint-url=http://localhost:4566 \

aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key missing-date-row-key \
  --body /etc/localstack/init/ready.d/summarylogs/missing-date-row.xlsx \
  --endpoint-url=http://localhost:4566 \

aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key reprocessor-regonly-valid-key \
  --body /etc/localstack/init/ready.d/summarylogs/reprocessor-regonly-valid.xlsx \
  --endpoint-url=http://localhost:4566 \

aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key reprocessor-regonly-invalid-key \
  --body /etc/localstack/init/ready.d/summarylogs/reprocessor-regonly-invalid.xlsx \
  --endpoint-url=http://localhost:4566 \

aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key exporter-regonly-valid-key \
  --body /etc/localstack/init/ready.d/summarylogs/exporter-regonly-valid.xlsx \
  --endpoint-url=http://localhost:4566 \

aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key exporter-regonly-invalid-key \
  --body /etc/localstack/init/ready.d/summarylogs/exporter-regonly-invalid.xlsx \
  --endpoint-url=http://localhost:4566 \

# Staleness test fixtures (reuse valid file with different keys)
aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key staleness-test-file-1-key \
  --body /etc/localstack/init/ready.d/summarylogs/valid-summary-log-input.xlsx \
  --endpoint-url=http://localhost:4566 \

aws s3api put-object \
  --bucket re-ex-summary-logs \
  --key staleness-test-file-2-key \
  --body /etc/localstack/init/ready.d/summarylogs/valid-summary-log-input.xlsx \
  --endpoint-url=http://localhost:4566 \
