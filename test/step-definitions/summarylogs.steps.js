import { Given, Then, When } from '@cucumber/cucumber'
import { baseAPI } from '../support/hooks.js'
import { SummaryLog } from '../support/generator.js'
import { expect } from 'chai'

Given('I have entered my summary log validation', function () {
  this.summaryLog = new SummaryLog()
  this.payload = this.summaryLog.toPayload()
})

Given('I have entered my summary log validation without filename', function () {
  this.summaryLog = new SummaryLog()
  this.payload = this.summaryLog.toPayload()
  delete this.payload.filename
})

Given('I have entered my summary log validation without fileId', function () {
  this.summaryLog = new SummaryLog()
  this.payload = this.summaryLog.toPayload()
  delete this.payload.fileId
})

Given('I have entered my summary log validation without s3Bucket', function () {
  this.summaryLog = new SummaryLog()
  this.payload = this.summaryLog.toPayload()
  delete this.payload.s3Bucket
})

Given('I have entered my summary log validation without s3Key', function () {
  this.summaryLog = new SummaryLog()
  this.payload = this.summaryLog.toPayload()
  delete this.payload.s3Key
})

When('I submit the summary log validation', async function () {
  const refNo = '68dc06020897dff9191b1354'
  const orgId = '500000'
  this.response = await baseAPI.post(
    `/v1/organisation/${orgId}/registration/${refNo}/summary-logs/validate`,
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
