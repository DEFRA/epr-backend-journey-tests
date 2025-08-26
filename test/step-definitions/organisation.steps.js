import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from 'chai'
import { BaseAPI } from '../apis/base-api.js'
import orgPayload from '../fixtures/organisation.json' with { type: 'json' }

const baseAPI = new BaseAPI()

Given('I have entered my organisation details', function () {
  this.payload = orgPayload
})

Given(
  'I have entered my organisation details without pages metadata',
  function () {
    this.payload = JSON.parse(JSON.stringify(orgPayload))
    delete this.payload.meta.definition.pages
  }
)

Given('I have entered my organisation details without data', function () {
  this.payload = JSON.parse(JSON.stringify(orgPayload))
  delete this.payload.data
})

Given('I have entered my organisation details without email', function () {
  this.payload = JSON.parse(JSON.stringify(orgPayload))
  delete this.payload.data.main.aSoxDO
})

Given(
  'I have entered my organisation details without organisation name',
  function () {
    this.payload = JSON.parse(JSON.stringify(orgPayload))
    delete this.payload.data.main.JbEBvr
  }
)

Given('I have entered my organisation details without nations', function () {
  this.payload = JSON.parse(JSON.stringify(orgPayload))
  delete this.payload.data.main.VcdRNr
})

Given(
  'I have entered my organisation details with nations value of {string}',
  function (nations) {
    this.payload = JSON.parse(JSON.stringify(orgPayload))
    this.payload.data.main.VcdRNr = nations
  }
)

When('I submit the organisation details', async function () {
  this.response = await baseAPI.post(
    '/v1/apply/organisation',
    JSON.stringify(this.payload)
  )
})

Then(
  'I should receive a successful organisation details response with the organisation name {string}',
  async function (orgName) {
    expect(this.response.statusCode).to.equal(200)
    const responseData = await this.response.body.json()
    expect(responseData.orgId).to.match(/^\d{6}$/)
    expect(responseData.referenceNumber).to.match(/^[0-9a-f]{24}$/i)
    expect(responseData.orgName).to.equal(orgName)
  }
)
