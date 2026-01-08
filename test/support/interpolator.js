export class Interpolator {
  interpolate(context, expectedMessage) {
    if (
      expectedMessage.includes('{{summaryLogId}}') &&
      context.summaryLog?.summaryLogId
    ) {
      expectedMessage = expectedMessage.replace(
        '{{summaryLogId}}',
        context.summaryLog.summaryLogId
      )
    }
    if (
      expectedMessage.includes('{{summaryLogFileId}}') &&
      context.summaryLog?.fileId
    ) {
      expectedMessage = expectedMessage.replace(
        '{{summaryLogFileId}}',
        context.summaryLog.fileId
      )
    }
    if (
      expectedMessage.includes('{{summaryLogFilename}}') &&
      context.summaryLog?.fileId
    ) {
      expectedMessage = expectedMessage.replace(
        '{{summaryLogFilename}}',
        context.summaryLog.filename
      )
    }
    if (
      expectedMessage.includes('{{summaryLogFileStatus}}') &&
      context.summaryLog?.fileStatus
    ) {
      expectedMessage = expectedMessage.replace(
        '{{summaryLogFileStatus}}',
        context.summaryLog.fileStatus
      )
    }
    if (
      expectedMessage.includes('{{summaryLogS3Key}}') &&
      context.summaryLog?.s3Key
    ) {
      expectedMessage = expectedMessage.replace(
        '{{summaryLogS3Key}}',
        context.summaryLog.s3Key
      )
    }
    if (
      expectedMessage.includes('{{summaryLogS3Bucket}}') &&
      context.summaryLog?.s3Key
    ) {
      expectedMessage = expectedMessage.replace(
        '{{summaryLogS3Bucket}}',
        context.summaryLog.s3Bucket
      )
    }
    if (expectedMessage.includes('{{version}}') && context.version) {
      expectedMessage = expectedMessage.replace('{{version}}', context.version)
    }

    return expectedMessage
  }
}
