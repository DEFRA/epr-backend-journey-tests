export class Interpolator {
  interpolate(context, expectedMessage) {
    const replacements = {
      '{{summaryLogId}}': context.summaryLog?.summaryLogId,
      '{{summaryLogFileId}}': context.summaryLog?.fileId,
      '{{summaryLogFilename}}': context.summaryLog?.filename,
      '{{summaryLogFileStatus}}': context.summaryLog?.fileStatus,
      '{{summaryLogS3Key}}': context.summaryLog?.s3Key,
      '{{summaryLogS3Bucket}}': context.summaryLog?.s3Bucket,
      '{{version}}': context.version
    }

    expectedMessage = Object.entries(replacements).reduce(
      (msg, [placeholder, value]) =>
        value ? msg.replace(placeholder, value) : msg,
      expectedMessage
    )

    return expectedMessage
  }
}
