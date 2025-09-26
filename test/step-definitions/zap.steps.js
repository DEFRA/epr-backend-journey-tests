import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from 'chai'
import { ZAPClient } from '../support/zap.js'
import { baseUrl } from '../apis/base-api.js'
import logger from '../support/logger.js'

const zapClient = new ZAPClient()

Given(
  'the ZAP spider scan is run for the following',
  { timeout: 30000 },
  async function (dataTable) {
    const dataTableRows = dataTable.rowsHash()
    const url = dataTableRows.Url
    const method = dataTableRows.Method
    this.params = { url: baseUrl + url }
    if (method === 'POST') {
      this.params.postData = {}
    }
    await zapClient.runSpider(this.params)
  }
)

When('I request the ZAP active scan', { timeout: 30000 }, async function () {
  await zapClient.runActiveScan(this.params)
})

Then(
  'I should receive no alerts from the ZAP report',
  { timeout: 30000 },
  async function () {
    const report = await zapClient.generateReport()
    if (report.site[0].alerts.length > 0) {
      report.site[0].alerts.forEach((alert) => {
        logger.error({
          step_definition:
            'Then I should receive no alerts from the ZAP report',
          zap_alert: alert
        })
      })
    }
    // eslint-disable-next-line no-unused-expressions
    expect(
      report.site[0].alerts,
      'There should not be ZAP alerts. Please check logs if there are ZAP alerts'
    ).to.be.an('array').that.is.empty
  }
)
