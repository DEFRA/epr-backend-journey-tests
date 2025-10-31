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
    if (expectedMessage.includes('{{version}}') && context.version) {
      expectedMessage = expectedMessage.replace('{{version}}', context.version)
    }

    return expectedMessage
  }
}
