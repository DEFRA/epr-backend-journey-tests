import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from 'chai'
import { BaseAPI } from '../apis/base-api.js'
import accPayload from '../fixtures/accreditation.json' with { type: 'json' }

const baseAPI = new BaseAPI()

Given('I have entered my accreditation details', function () {
  this.payload = accPayload
})

Given(
  'I have entered my accreditation details without pages metadata',
  function () {
    this.payload = JSON.parse(JSON.stringify(accPayload))
    delete this.payload.meta.definition.pages
  }
)

Given('I have entered my accreditation details without organisation ID', function () {
  this.payload = JSON.parse(JSON.stringify(accPayload))
  delete this.payload.data.main.Ooierc
})

Given(
  'I have entered my accreditation details without reference number',
  function () {
    this.payload = JSON.parse(JSON.stringify(accPayload))
    delete this.payload.data.main.MyWHms
  }
)

Given(
  'I have entered my accreditation details with orgId value of {string}',
  function (orgId) {
    this.payload = JSON.parse(JSON.stringify(accPayload))
    this.payload.data.main.Ooierc = orgId
  }
)

Given(
  "I have entered my accreditation details with reference number value of {string}",
  function (refNo) {
    this.payload = JSON.parse(JSON.stringify(accPayload))
    this.payload.data.main.MyWHms = refNo
  }
)


When('I submit the accreditation details', async function () {
  this.response = await baseAPI.post(
    '/v1/apply/accreditation',
    JSON.stringify(this.payload)
  )
})

Then(
  'I should receive an accreditation resource created response',
  async function () {
    expect(this.response.statusCode).to.equal(201)
  }
)
