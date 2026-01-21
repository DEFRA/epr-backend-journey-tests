import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from 'chai'
import { Registration } from '../support/generator.js'
import { dbClient, baseAPI } from '../support/hooks.js'
import logger from '../support/logger.js'

Given(
  'I have entered my registration details as a Reprocessor for all materials',
  function () {
    const orgId = this.orgResponseData?.orgId
    const refNo = this.orgResponseData?.referenceNumber
    this.registration = new Registration(orgId, refNo)
    this.payload = this.registration.toAllMaterialsPayload()
  }
)

Given('I have entered my registration details', function () {
  const orgId = this.orgResponseData?.orgId
  const refNo = this.orgResponseData?.referenceNumber
  this.registration = new Registration(orgId, refNo)
  this.payload = this.registration.toExporterPayload()
})

Given(
  'I have entered my registration details without pages metadata',
  function () {
    this.registration = new Registration()
    this.payload = this.registration.toExporterPayload()
    delete this.payload.meta.definition.pages
  }
)

Given('I have entered my registration details without data', function () {
  this.registration = new Registration()
  this.payload = this.registration.toExporterPayload()
  delete this.payload.data
})

Given(
  'I have entered my registration details without organisation ID',
  function () {
    this.registration = new Registration()
    this.payload = this.registration.toExporterPayload()
    delete this.payload.data.main.QnSRcX
  }
)

Given(
  'I have entered my registration details without reference number',
  function () {
    this.registration = new Registration()
    this.payload = this.registration.toExporterPayload()
    delete this.payload.data.main.RIXIzA
  }
)

Given(
  'I have entered my registration details with orgId value of {string}',
  function (orgId) {
    this.registration = new Registration()
    this.payload = this.registration.toExporterPayload()
    this.payload.data.main.QnSRcX = orgId
  }
)

Given(
  'I have entered my registration details with reference number value of {string}',
  function (refNo) {
    this.registration = new Registration()
    this.payload = this.registration.toExporterPayload()
    this.payload.data.main.RIXIzA = refNo
  }
)

Given(
  'I have entered my registration details with orgId {string} and reference number value of {string}',
  function (orgId, refNo) {
    this.registration = new Registration()
    this.registration.orgId = orgId
    this.registration.refNo = refNo
    this.payload = this.registration.toExporterPayload()
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
      const expectedRefNumber = this.registration.refNo
      const expectedOrgId = this.registration.orgId
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
      expect(JSON.stringify(registration.rawSubmissionData.meta)).to.equal(
        JSON.stringify(this.payload.meta)
      )
      expect(JSON.stringify(registration.rawSubmissionData.data)).to.equal(
        JSON.stringify(this.payload.data)
      )
      expect(
        registration.answers.find(
          (a) => a.shortDescription === 'Organisation ID'
        ).value
      ).to.equal(expectedOrgId)
      expect(
        registration.answers.find(
          (a) => a.shortDescription === 'System Reference'
        ).value
      ).to.equal(expectedRefNumber)
      expect(
        registration.answers.find(
          (a) => a.shortDescription === 'App contact name'
        ).value
      ).to.equal(this.registration.fullName)
      expect(
        registration.answers.find(
          (a) => a.shortDescription === 'Submitter name'
        ).value
      ).to.equal(this.registration.fullName)
      expect(
        registration.answers.find(
          (a) => a.shortDescription === 'Submitter email address'
        ).value
      ).to.equal(this.registration.email)
      expect(
        registration.answers.find(
          (a) => a.shortDescription === 'App contact email address'
        ).value
      ).to.equal(this.registration.email)
      expect(
        registration.answers.find(
          (a) => a.shortDescription === 'App contact telephone number'
        ).value
      ).to.equal(this.registration.phoneNumber)
      expect(
        registration.answers.find(
          (a) => a.shortDescription === 'App contact job title'
        ).value
      ).to.equal(this.registration.jobTitle)
      expect(
        registration.answers.find(
          (a) => a.shortDescription === 'Address to serve notices'
        ).value
      ).to.equal(this.registration.addressServiceNotice)
      expect(
        registration.answers.find(
          (a) => a.shortDescription === 'Carrier, broker or dealer number'
        ).value
      ).to.equal(this.registration.wasteRegNo)
    } else {
      logger.warn(
        {
          step_definition:
            'Then I should see that a registration is created in the database'
        },
        'Skipping registration database checks'
      )
    }
  }
)
