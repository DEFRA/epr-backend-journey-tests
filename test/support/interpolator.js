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
    return expectedMessage
  }
}
