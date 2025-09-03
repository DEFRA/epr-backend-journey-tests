import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from 'chai'
import { BaseAPI } from '../apis/base-api.js'
import { generateOrganisation } from '../support/generator.js'

const baseAPI = new BaseAPI()

Given('I have entered my organisation details', function () {
  this.payload = generateOrganisation()
})

Given(
  'I have entered my organisation details without pages metadata',
  function () {
    this.payload = generateOrganisation()
    delete this.payload.meta.definition.pages
  }
)

Given('I have entered my organisation details without data', function () {
  this.payload = generateOrganisation()
  delete this.payload.data
})

Given('I have entered my organisation details without email', function () {
  this.payload = generateOrganisation()
  delete this.payload.data.main.aSoxDO
})

Given(
  'I have entered my organisation details without organisation name',
  function () {
    this.payload = generateOrganisation()
    delete this.payload.data.main.JbEBvr
  }
)

Given('I have entered my organisation details without nations', function () {
  this.payload = generateOrganisation()
  delete this.payload.data.main.VcdRNr
})

When('I submit the organisation details', async function () {
  this.response = await baseAPI.post(
    '/v1/apply/organisation',
    JSON.stringify(this.payload)
  )
})

Then(
  'I should receive a successful organisation details response',
  async function () {
    expect(this.response.statusCode).to.equal(200)
    const responseData = await this.response.body.json()
    expect(responseData.orgId).to.match(/^\d{6}$/)
    expect(responseData.referenceNumber).to.match(/^[0-9a-f]{24}$/i)
    expect(responseData.orgName).to.equal(this.payload.data.main.JbEBvr)
  }
)
