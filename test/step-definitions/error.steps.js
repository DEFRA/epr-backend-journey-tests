import { Given, Then } from '@cucumber/cucumber'
import { expect } from 'chai'
import { DockerLogTester } from '../support/docker.js'

const dockerLogTester = new DockerLogTester(
  'epr-backend-journey-tests-epr-backend-1'
)

Given('I have not entered any details', function () {
  this.payload = null
})

Given('I have entered invalid details', function () {
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

Then(
  'the following information appears in the log',
  async function (dataTable) {
    const logMessage = dataTable.rowsHash()
    await dockerLogTester.assertLogs([
      DockerLogTester.assertions.hasLogLevel(logMessage['Log Level']),
      DockerLogTester.assertions.hasEventAction(logMessage['Event Action']),
      DockerLogTester.assertions.hasMessage(logMessage.Message)
    ])
  }
)
