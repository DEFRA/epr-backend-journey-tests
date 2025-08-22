import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from 'chai'
import { BaseAPI } from '../apis/base-api.js'

const baseAPI = new BaseAPI()

Given('I have entered my organisation details', function () {
  this.details = {}
})

When('I submit the organisation details', async function () {
  this.response = await baseAPI.post(
    '/v1/apply/organisation',
    JSON.stringify(this.details)
  )
})

Then(
  'I should receive the following organisation details response',
  async function (dataTable) {
    const expectation = dataTable.rowsHash()
    expect(this.response.statusCode).to.equal(200)
    const responseData = await this.response.body.json()
    expect(responseData).to.equal(expectation.orgId)
    expect(responseData.referenceNumber).to.equal(expectation.referenceNumber)
    expect(responseData.orgName).to.equal(expectation.orgName)
  }
)

Then(
  'I should receive an error response from the organisation endpoint',
  async function () {
    expect(this.response.statusCode).to.equal(400)
    const responseData = await this.response.body.json()
    expect(responseData).to.have.property('message')
    expect(responseData.message).to.equal('Invalid payload')
  }
)
