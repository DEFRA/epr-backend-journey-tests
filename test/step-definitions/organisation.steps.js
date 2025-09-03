import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from 'chai'
import { BaseAPI } from '../apis/base-api.js'
import orgPayload from '../fixtures/organisation.json' with { type: 'json' }
import { fakerEN_GB } from '@faker-js/faker'

const baseAPI = new BaseAPI()

const roles = ['Reprocessor', 'Exporter', 'Reprocessor and exporter']
const nations = ['England', 'Northern Ireland', 'Scotland', 'Wales']

function randomiseData(payload) {
  payload = JSON.parse(JSON.stringify(payload))

  const phoneNumber = fakerEN_GB.phone.number()
  const fullName = fakerEN_GB.person.fullName()
  const email = fakerEN_GB.internet.email()
  const jobTitle = fakerEN_GB.person.jobTitle()

  const address =
    fakerEN_GB.location.streetAddress() +
    ',' +
    fakerEN_GB.location.city() +
    ',' +
    fakerEN_GB.location.zipCode()

  const companyName = fakerEN_GB.company.name() + ' Limited'

  const roleIndex = Math.floor(Math.random() * roles.length)
  const role = roles[roleIndex]
  const numberOfNations = Math.floor(Math.random() * nations.length) + 1

  payload.data.main.BYtjnh = fullName
  payload.data.main.aSoxDO = email
  payload.data.main.aIFHXo = phoneNumber
  payload.data.main.LyeSzH = jobTitle
  payload.data.main.WVADkQ = role
  payload.data.main.JbEBvr = companyName
  payload.data.main.QdhMJS = companyName
  payload.data.main.VcdRNr = nations.slice(0, numberOfNations).join(', ')
  payload.data.main.VATjEi = address

  return payload
}

Given('I have entered my organisation details', function () {
  this.payload = randomiseData(orgPayload)
})

Given(
  'I have entered my organisation details without pages metadata',
  function () {
    this.payload = randomiseData(orgPayload)
    delete this.payload.meta.definition.pages
  }
)

Given('I have entered my organisation details without data', function () {
  this.payload = randomiseData(orgPayload)
  delete this.payload.data
})

Given('I have entered my organisation details without email', function () {
  this.payload = randomiseData(orgPayload)
  delete this.payload.data.main.aSoxDO
})

Given(
  'I have entered my organisation details without organisation name',
  function () {
    this.payload = randomiseData(orgPayload)
    delete this.payload.data.main.JbEBvr
  }
)

Given('I have entered my organisation details without nations', function () {
  this.payload = randomiseData(orgPayload)
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
