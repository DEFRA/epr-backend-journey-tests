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
    expect(responseData.orgId).to.equal(expectation.orgId)
    expect(responseData.referenceNumber).to.equal(expectation.referenceNumber)
    expect(responseData.orgName).to.equal(expectation.orgName)
  }
)

