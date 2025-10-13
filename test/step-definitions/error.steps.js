import { Given, Then } from '@cucumber/cucumber'
import { expect } from 'chai'
import { SummaryLog } from '../support/generator.js'

const setupSummaryLog = (context) => {
  context.summaryLog = new SummaryLog()
  context.summaryLog.setFileData(
    'test-bucket',
    'test-key',
    'test-file-id',
    'test-filename.xlsx'
  )
}

Given('I have not entered any details', function () {
  setupSummaryLog(this)
  this.payload = null
})

Given('I have entered invalid details', function () {
  setupSummaryLog(this)
  this.payload = 'invalid-data'
})

Then('I should receive an internal server error response', async function () {
  expect(this.response.statusCode).to.equal(500)
  const responseData = await this.response.body.json()
  expect(responseData).to.have.property('error')
  expect(responseData.error).to.equal('Internal Server Error')
  expect(responseData).to.have.property('message')
  expect(responseData.message).to.equal('An internal server error occurred')
})

Then(
  'I should receive a {int} error response {string}',
  async function (code, errMessage) {
    expect(this.response.statusCode).to.equal(code)
    const responseData = await this.response.body.json()
    expect(responseData).to.have.property('message')
    expect(responseData.message).to.equal(errMessage)
  }
)
