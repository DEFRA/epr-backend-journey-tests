import { request } from 'undici'
import config from '../config/config.js'
import logger from '../support/logger.js'

export async function waitForSummaryLogFiles() {
  const endpoint = `http://${config.localstackHost.local}:4566`
  const bucketName = 're-ex-summary-logs'
  const maxAttempts = 20
  const interval = 500

  const fileKeys = [
    'exporter-invalid-key',
    'exporter-key',
    'exporter-adjustments-key',
    'glass-other-output-key',
    'glass-remelt-input-key',
    'invalid-row-id-key',
    'invalid-table-name-key',
    'invalid-test-upload-key',
    'reprocessor-input-adjustments-key',
    'reprocessor-input-invalid-key',
    'reprocessor-input-senton-invalid-key',
    'reprocessor-input-valid-key',
    'reprocessor-output-adjustments-key',
    'reprocessor-output-invalid-key',
    'reprocessor-output-valid-key',
    'staleness-test-file-1-key',
    'staleness-test-file-2-key',
    'test-upload-key',
    'valid-summary-log-input-2-key',
    'valid-summary-log-input-key'
  ]

  logger.info('Waiting for Summary Logs S3 files to be ready...')

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const checks = await Promise.all(
        fileKeys.map(async (key) => {
          try {
            const { statusCode } = await request(
              `${endpoint}/${bucketName}/${key}`,
              {
                method: 'HEAD'
              }
            )
            return statusCode === 200
          } catch (err) {
            return false
          }
        })
      )

      if (checks.every(Boolean)) {
        logger.info('All Summary Logs S3 files are ready!')
        return true
      }

      await new Promise((resolve) => setTimeout(resolve, interval))
    } catch (err) {
      await new Promise((resolve) => setTimeout(resolve, interval))
    }
  }

  throw new Error('Timeout waiting for S3 files')
}
