import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from 'chai'
import { Accreditation } from '../support/generator.js'
import { dbClient, baseAPI } from '../support/hooks.js'
import logger from '../support/logger.js'

Given('I have entered my accreditation details', function () {
  this.accreditation = new Accreditation()
  this.payload = this.accreditation.toPayload()
})

Given(
  'I have entered my accreditation details without pages metadata',
  function () {
    this.accreditation = new Accreditation()
    this.payload = this.accreditation.toPayload()
    delete this.payload.meta.definition.pages
  }
)

Given(
  'I have entered my accreditation details without organisation ID',
  function () {
    this.accreditation = new Accreditation()
    this.payload = this.accreditation.toPayload()
    delete this.payload.data.main.Ooierc
  }
)

Given(
  'I have entered my accreditation details without reference number',
  function () {
    this.accreditation = new Accreditation()
    this.payload = this.accreditation.toPayload()
    delete this.payload.data.main.MyWHms
  }
)

Given(
  'I have entered my accreditation details with orgId value of {string}',
  function (orgId) {
    this.accreditation = new Accreditation()
    this.payload = this.accreditation.toPayload()
    this.payload.data.main.Ooierc = orgId
  }
)

Given(
  'I have entered my accreditation details with reference number value of {string}',
  function (refNo) {
    this.accreditation = new Accreditation()
    this.payload = this.accreditation.toPayload()
    this.payload.data.main.MyWHms = refNo
  }
)

Given(
  'I have entered my accreditation details with orgId {string} and reference number value of {string}',
  function (orgId, refNo) {
    this.accreditation = new Accreditation()
    this.accreditation.orgId = orgId
    this.accreditation.refNo = refNo
    this.payload = this.accreditation.toPayload()
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

Then(
  'I should see that an accreditation is created in the database',
  async function () {
    if (!process.env.ENVIRONMENT) {
      const expectedRefNumber = this.payload.data.main.MyWHms
      const expectedOrgId = this.payload.data.main.Ooierc
      const accreditationCollection = dbClient.collection('accreditation')
      const accreditation = await accreditationCollection.findOne({
        referenceNumber: expectedRefNumber
      })
      expect(Object.keys(accreditation)).have.all.members([
        '_id',
        'answers',
        'createdAt',
        'orgId',
        'rawSubmissionData',
        'referenceNumber',
        'schemaVersion'
      ])
      expect(accreditation.referenceNumber).to.equal(expectedRefNumber)
      expect(accreditation.orgId).to.equal(parseInt(expectedOrgId))
      expect(accreditation.schemaVersion).to.equal(1)
      expect(accreditation.answers.length).to.equal(25)
      expect(JSON.stringify(accreditation.rawSubmissionData.meta)).to.equal(
        JSON.stringify(this.payload.meta)
      )
      expect(JSON.stringify(accreditation.rawSubmissionData.data)).to.equal(
        JSON.stringify(this.payload.data)
      )
      expect(
        accreditation.answers.find(
          (a) => a.shortDescription === 'Organisation ID'
        ).value
      ).to.equal(expectedOrgId)
      expect(
        accreditation.answers.find(
          (a) => a.shortDescription === 'System Reference'
        ).value
      ).to.equal(expectedRefNumber)
      expect(
        accreditation.answers.find(
          (a) => a.shortDescription === 'Packaging waste category to accredit'
        ).value
      ).to.equal(this.accreditation.material)
      expect(
        accreditation.answers.find((a) => a.shortDescription === 'Tonnage band')
          .value
      ).to.equal(this.accreditation.tonnageBand)
      expect(
        accreditation.answers.find(
          (a) => a.shortDescription === 'Submitter name'
        ).value
      ).to.equal(this.accreditation.fullName)
      expect(
        accreditation.answers.find(
          (a) => a.shortDescription === 'Submitter email address'
        ).value
      ).to.equal(this.accreditation.email)
      expect(
        accreditation.answers.find(
          (a) => a.shortDescription === 'Submitter telephone number'
        ).value
      ).to.equal(this.accreditation.phoneNumber)
      expect(
        accreditation.answers.find(
          (a) => a.shortDescription === 'Submitter job title'
        ).value
      ).to.equal(this.accreditation.jobTitle)
    } else {
      logger.warn(
        {
          step_definition:
            'Then I should see that an accreditation is created in the database'
        },
        'Skipping accreditation database checks'
      )
    }
  }
)
