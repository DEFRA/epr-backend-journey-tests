import { Given, Then, When } from '@cucumber/cucumber'
import { baseAPI, dbClient } from '../support/hooks.js'
import { SummaryLog } from '../support/generator.js'
import { expect } from 'chai'
import logger from '../support/logger.js'

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
    `/v1/organisation/${this.summaryLog.orgId}/registration/${this.summaryLog.regId}/summary-logs/validate`,
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

Given(
  'the organisation and registration details I have the following summary log upload data',
  function (dataTable) {
    this.summaryLog = new SummaryLog()
    this.summaryLog.orgId = '6507f1f77bcf86cd79943921'
    this.summaryLog.regId = '6507f1f77bcf86cd79943922'
    this.uploadData = dataTable.rowsHash()
    this.payload = this.summaryLog.toUploadCompletedPayload(this.uploadData)
  }
)

When('the summary log upload data is updated', function (dataTable) {
  this.uploadData = dataTable.rowsHash()
  this.payload = this.summaryLog.toUploadCompletedPayload(this.uploadData)
})

When('I submit the summary log upload completed', async function () {
  const summaryLogId = this.summaryLog.summaryLogId
  this.response = await baseAPI.post(
    `/v1/organisations/${this.summaryLog.orgId}/registrations/${this.summaryLog.regId}/summary-logs/${summaryLogId}/upload-completed`,
    JSON.stringify(this.payload)
  )
})

Then(
  'I should receive a summary log upload accepted response',
  async function () {
    expect(this.response.statusCode).to.equal(202)
  }
)

Then(
  'I should see that a summary log is created in the database with the following values',
  async function (dataTable) {
    if (!process.env.ENVIRONMENT) {
      const expectedSummaryLog = dataTable.rowsHash()
      const summaryLogCollection = dbClient.collection('summary-logs')
      const summaryLog = await summaryLogCollection.findOne({
        _id: this.summaryLog.summaryLogId
      })
      expect(summaryLog._id).to.equal(this.summaryLog.summaryLogId)
      expect(summaryLog.file.id).to.equal(expectedSummaryLog.fileId)
      expect(summaryLog.file.name).to.equal(expectedSummaryLog.filename)
      expect(summaryLog.file.status).to.equal(expectedSummaryLog.fileStatus)
      expect(summaryLog.status).to.equal(expectedSummaryLog.status)
      switch (expectedSummaryLog.fileStatus) {
        case 'complete':
          expect(summaryLog.file.s3.key).to.equal(expectedSummaryLog.s3Key)
          expect(summaryLog.file.s3.bucket).to.equal(
            expectedSummaryLog.s3Bucket
          )
          break
        case 'rejected':
          expect(summaryLog.failureReason).to.equal(
            expectedSummaryLog.failureReason
          )
          break
      }
    } else {
      logger.warn(
        {
          step_definition:
            'Then I should see that a summary log is created in the database with the following values'
        },
        'Skipping summary log database checks'
      )
    }
  }
)
