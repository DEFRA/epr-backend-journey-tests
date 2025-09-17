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
      expect(accreditation.answers.length).to.equal(23)
      expect(JSON.stringify(accreditation.rawSubmissionData.meta)).to.equal(
        JSON.stringify(this.payload.meta)
      )
      expect(JSON.stringify(accreditation.rawSubmissionData.data)).to.equal(
        JSON.stringify(this.payload.data)
      )
      expect(accreditation.answers[1].value).to.equal(expectedOrgId)
      expect(accreditation.answers[2].value).to.equal(expectedRefNumber)
      expect(accreditation.answers[3].value).to.equal(
        this.accreditation.material
      )
      expect(accreditation.answers[4].value).to.equal(
        this.accreditation.tonnageBand
      )
      expect(accreditation.answers[19].value).to.equal(
        this.accreditation.fullName
      )
      expect(accreditation.answers[20].value).to.equal(this.accreditation.email)
      expect(accreditation.answers[21].value).to.equal(
        this.accreditation.phoneNumber
      )
      expect(accreditation.answers[22].value).to.equal(
        this.accreditation.jobTitle
      )
    } else {
      logger.warn(
        {
          // eslint-disable-next-line camelcase
          step_definition:
            'Then I should see that an accreditation is created in the database'
        },
        'Skipping accreditation database checks'
      )
    }
  }
)
