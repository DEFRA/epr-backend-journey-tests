import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from 'chai'
import { ZAPClient } from '../support/zap.js'
import config from '../config/config.js'
import logger from '../support/logger.js'
import 'allure-cucumberjs'
import { attachment, step } from 'allure-js-commons'

const zapClient = new ZAPClient()

Given(
  'the ZAP spider scan is run for the following',
  { timeout: 30000 },
  async function (dataTable) {
    const dataTableRows = dataTable.rowsHash()
    const url = dataTableRows.Url
    const method = dataTableRows.Method
    this.params = { url: config.zapTargetApiUri + url }
    if (method === 'POST') {
      this.params.postData = {}
    }
    await zapClient.runSpider(this.params)
  }
)

When(
  'I request the full ZAP active scan',
  { timeout: 30000 },
  async function () {
    await zapClient.runFullActiveScan(this.params)
  }
)

When(
  'I request the partial ZAP active scan',
  { timeout: 30000 },
  async function () {
    await zapClient.runPartialActiveScan(this.params)
  }
)

Then(
  'I should receive no alerts from the ZAP report',
  { timeout: 30000 },
  async function () {
    const report = await zapClient.generateReport()
    await logAlertsToAllure(report.site[0].alerts)
    logger.info({
      // eslint-disable-next-line camelcase
      zap_report: report,
      step_definition: 'Then I should receive no alerts from the ZAP report'
    })
    // eslint-disable-next-line no-unused-expressions
    expect(
      report.site[0].alerts,
      'There should not be ZAP alerts. Please check logs if there are ZAP alerts'
    ).to.be.an('array').that.is.empty
  }
)

async function logAlertsToAllure(alerts) {
  alerts.forEach((alert, index) => {
    step(
      `Alert ${index + 1}: ${alert.alert} | AlertRef: ${alert.alertRef} | Risk Description: ${alert.riskdesc}`,
      () => function () {}
    )
    const outputHtml = `<p><ul>
                                <li><b>Alert:</b> ${alert.alert}</li>
                                <li><b>Name:</b> ${alert.name}</li>
                                <li><b>Plugin ID:</b> ${alert.pluginid}</li>
                                <li><b>Alert Reference:</b> ${alert.alertRef}</li>
                                <li><b>Risk Description:</b> ${alert.riskdesc}</li>
                                <li><b>Description:</b> ${alert.desc}</li>
                                <li><b>ZAProxy URL:</b> <a href="https://www.zaproxy.org/docs/alerts/${alert.alertRef}" target="_blank">Alert Summary</a></li>
                               </ul></p>`
    attachment(`Output`, outputHtml, 'text/html')
  })
}
