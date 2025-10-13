import { Given, Then, When } from '@cucumber/cucumber'
import { baseAPI } from '../support/hooks.js'
import { SummaryLog } from '../support/generator.js'
import { expect } from 'chai'

Given('I have entered my summary log validation', function (dataTable) {
  this.summaryLog = new SummaryLog()
  this.payload = this.summaryLog.toPayload()

  if (dataTable) {
    const data = dataTable.rowsHash()
    if (data['S3 Bucket']) {
      this.payload.s3Bucket = data['S3 Bucket']
      this.summaryLog.s3Bucket = data['S3 Bucket']
    }
    if (data['S3 Key']) {
      this.payload.s3Key = data['S3 Key']
      this.summaryLog.s3Key = data['S3 Key']
    }
    if (data.fileId) {
      this.payload.fileId = data.fileId
      this.summaryLog.fileId = data.fileId
    }
    if (data.filename) {
      this.payload.filename = data.filename
      this.summaryLog.filename = data.filename
    }
  }
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
