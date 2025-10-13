import { Given, Then, When } from '@cucumber/cucumber'
import { baseAPI } from '../support/hooks.js'
import { SummaryLog } from '../support/generator.js'
import { expect } from 'chai'

const setupSummaryLogWithDefaults = (context) => {
  context.summaryLog = new SummaryLog()
  context.summaryLog.setFileData(
    'test-bucket',
    'test-key',
    'test-file-id',
    'test-filename.xlsx'
  )
}

Given('I have entered my summary log validation', function (dataTable) {
  this.summaryLog = new SummaryLog()
  const data = dataTable.rowsHash()
  this.summaryLog.setFileData(
    data['S3 Bucket'],
    data['S3 Key'],
    data.fileId,
    data.filename
  )
  this.payload = this.summaryLog.toPayload()
})

Given(
  'I have entered my summary log validation without {word}',
  function (field) {
    setupSummaryLogWithDefaults(this)
    this.payload = this.summaryLog.toPayload()
    delete this.payload[field]
  }
)

When('I submit the summary log validation', async function () {
  this.response = await baseAPI.post(
    `/v1/organisation/${this.summaryLog.orgId}/registration/${this.summaryLog.refNo}/summary-logs/validate`,
    JSON.stringify(this.payload)
  )
})

Then('I should receive a summary log validating response', async function () {
  expect(this.response.statusCode).to.equal(202)
  this.responseData = await this.response.body.json()
  expect(this.responseData.status).to.equal('validating')
})

Given('I have the following summary log upload data', function (dataTable) {
  this.summaryLog = new SummaryLog()
  this.uploadData = dataTable.rowsHash()
  this.payload = this.summaryLog.toUploadCompletedPayload(this.uploadData)
})

When('I submit the summary log upload completed', async function () {
  const refNo = '68dc06020897dff9191b1354'
  const orgId = '500000'
  const summaryLogId = this.summaryLog.summaryLogId
  this.response = await baseAPI.post(
    `/v1/organisations/${orgId}/registrations/${refNo}/summary-logs/${summaryLogId}/upload-completed`,
    JSON.stringify(this.payload)
  )
})

Then(
  'I should receive a summary log upload accepted response',
  async function () {
    if (this.response.statusCode !== 202) {
      const responseBody = await this.response.body.text()
      throw new Error(
        `Expected 202 but got ${this.response.statusCode}. Response: ${responseBody}`
      )
    }
    expect(this.response.statusCode).to.equal(202)
  }
)
