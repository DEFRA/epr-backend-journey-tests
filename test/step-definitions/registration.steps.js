import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from 'chai'
import { Registration } from '../support/generator.js'
import { dbClient, baseAPI } from '../support/hooks.js'
import logger from '../support/logger.js'

Given('I have entered my registration details', function () {
  this.registration = new Registration()
  this.payload = this.registration.toPayload()
})

Given(
  'I have entered my registration details without pages metadata',
  function () {
    this.registration = new Registration()
    this.payload = this.registration.toPayload()
    delete this.payload.meta.definition.pages
  }
)

Given('I have entered my registration details without data', function () {
  this.registration = new Registration()
  this.payload = this.registration.toPayload()
  delete this.payload.data
})

Given(
  'I have entered my registration details without organisation ID',
  function () {
    this.registration = new Registration()
    this.payload = this.registration.toPayload()
    delete this.payload.data.main.QnSRcX
  }
)

Given(
  'I have entered my registration details without reference number',
  function () {
    this.registration = new Registration()
    this.payload = this.registration.toPayload()
    delete this.payload.data.main.RIXIzA
  }
)

Given(
  'I have entered my registration details with orgId value of {string}',
  function (orgId) {
    this.registration = new Registration()
    this.payload = this.registration.toPayload()
    this.payload.data.main.QnSRcX = orgId
  }
)

Given(
  'I have entered my registration details with reference number value of {string}',
  function (refNo) {
    this.registration = new Registration()
    this.payload = this.registration.toPayload()
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

Then(
  'I should see that a registration is created in the database',
  async function () {
    if (!process.env.ENVIRONMENT) {
      const expectedRefNumber = this.payload.data.main.RIXIzA
      const expectedOrgId = this.payload.data.main.QnSRcX
      const registrationCollection = dbClient.collection('registration')
      const registration = await registrationCollection.findOne({
        referenceNumber: expectedRefNumber
      })
      expect(Object.keys(registration)).have.all.members([
        '_id',
        'answers',
        'createdAt',
        'orgId',
        'rawSubmissionData',
        'referenceNumber',
        'schemaVersion'
      ])
      expect(registration.referenceNumber).to.equal(expectedRefNumber)
      expect(registration.orgId).to.equal(parseInt(expectedOrgId))
      expect(registration.schemaVersion).to.equal(1)
      expect(registration.answers.length).to.equal(20)
      expect(JSON.stringify(registration.rawSubmissionData.meta)).to.equal(
        JSON.stringify(this.payload.meta)
      )
      expect(JSON.stringify(registration.rawSubmissionData.data)).to.equal(
        JSON.stringify(this.payload.data)
      )
      expect(registration.answers[1].value).to.equal(expectedOrgId)
      expect(registration.answers[2].value).to.equal(expectedRefNumber)
      expect(registration.answers[3].value).to.equal(this.registration.fullName)
      expect(registration.answers[4].value).to.equal(this.registration.email)
      expect(registration.answers[5].value).to.equal(
        this.registration.phoneNumber
      )
      expect(registration.answers[6].value).to.equal(this.registration.jobTitle)
      expect(registration.answers[7].value).to.equal(this.registration.address)
      expect(registration.answers[8].value).to.equal(
        this.registration.wasteRegNo
      )
      expect(registration.answers[9].value).to.equal(
        this.registration.permitType
      )
      expect(registration.answers[10].value).to.equal(
        this.registration.permitNo
      )
      expect(registration.answers[11].value).to.equal(
        this.registration.material
      )
      expect(registration.answers[12].value).to.equal(
        this.registration.fullName
      )
      expect(registration.answers[13].value).to.equal(this.registration.email)
    } else {
      logger.warn(
        {
          // eslint-disable-next-line camelcase
          step_definition:
            'Then I should see that a registration is created in the database'
        },
        'Skipping registration database checks'
      )
    }
  }
)
