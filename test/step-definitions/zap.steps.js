import { When, Then } from '@cucumber/cucumber'
import { expect } from 'chai'
import { ZAPClient } from '../support/zap.js'
import { baseUrl } from '../apis/base-api.js'

const zapClient = new ZAPClient()

When(
  'I request the Zap spider scan to {string}',
  { timeout: 30000 },
  async function (url) {
    await zapClient.runSpider(baseUrl + url)
  }
)

When(
  'I request the Zap active scan to {string}',
  { timeout: 30000 },
  async function (url) {
    await zapClient.runActiveScan(baseUrl + url)
  }
)

Then(
  'I should receive no alerts from the Zap report',
  { timeout: 30000 },
  async function () {
    const report = await zapClient.generateReport()
    // eslint-disable-next-line no-unused-expressions
    expect(report.site[0].alerts, 'There should not be Zap alerts').to.be.an(
      'array'
    ).that.is.empty
  }
)
