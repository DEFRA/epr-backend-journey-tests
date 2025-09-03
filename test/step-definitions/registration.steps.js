import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from 'chai'
import { BaseAPI } from '../apis/base-api.js'
import { generateRegistration } from '../support/generator.js'

const baseAPI = new BaseAPI()

Given('I have entered my registration details', function () {
  this.payload = generateRegistration()
})

Given(
  'I have entered my registration details without pages metadata',
  function () {
    this.payload = generateRegistration()
    delete this.payload.meta.definition.pages
  }
)

Given('I have entered my registration details without data', function () {
  this.payload = generateRegistration()
  delete this.payload.data
})

Given(
  'I have entered my registration details without organisation ID',
  function () {
    this.payload = generateRegistration()
    delete this.payload.data.main.QnSRcX
  }
)

Given(
  'I have entered my registration details without reference number',
  function () {
    this.payload = generateRegistration()
    delete this.payload.data.main.RIXIzA
  }
)

Given(
  'I have entered my registration details with orgId value of {string}',
  function (orgId) {
    this.payload = generateRegistration()
    this.payload.data.main.QnSRcX = orgId
  }
)

Given(
  'I have entered my registration details with reference number value of {string}',
  function (refNo) {
    this.payload = generateRegistration()
    this.payload.data.main.RIXIzA = refNo
  }
)

When('I submit the registration details', async function () {
  this.response = await baseAPI.post(
    '/v1/apply/registration',
    JSON.stringify(this.payload)
  )
})

Then(
  'I should receive a registration resource created response',
  async function () {
    expect(this.response.statusCode).to.equal(201)
  }
)
