import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from 'chai'
import { Organisation } from '../support/generator.js'
import { dbClient, baseAPI } from '../support/hooks.js'
import logger from '../support/logger.js'

Given('I have entered my organisation details', function () {
  this.organisation = new Organisation()
  this.payload = this.organisation.toPayload()
})

Given(
  'I have entered my organisation details without pages metadata',
  function () {
    this.organisation = new Organisation()
    this.payload = this.organisation.toPayload()
    delete this.payload.meta.definition.pages
  }
)

Given('I have entered my organisation details without data', function () {
  this.organisation = new Organisation()
  this.payload = this.organisation.toPayload()
  delete this.payload.data
})

Given('I have entered my organisation details without email', function () {
  this.organisation = new Organisation()
  this.payload = this.organisation.toPayload()
  delete this.payload.data.main.aSoxDO
})

Given(
  'I have entered my organisation details without organisation name',
  function () {
    this.organisation = new Organisation()
    this.payload = this.organisation.toPayload()
    delete this.payload.data.main.JbEBvr
  }
)

Given('I have entered my organisation details without nations', function () {
  this.organisation = new Organisation()
  this.payload = this.organisation.toPayload()
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
    this.responseData = await this.response.body.json()
    expect(this.responseData.orgId).to.match(/^\d{6}$/)
    expect(this.responseData.referenceNumber).to.match(/^[0-9a-f]{24}$/i)
    expect(this.responseData.orgName).to.equal(this.payload.data.main.JbEBvr)
  }
)

Then(
  'I should see that an organisation details is created in the database',
  async function () {
    if (!process.env.ENVIRONMENT) {
      const expectedOrgId = this.responseData.orgId
      const expectedOrgName = this.responseData.orgName
      const organisationCollection = dbClient.collection('organisation')
      const organisation = await organisationCollection.findOne({
        orgId: expectedOrgId
      })
      expect(Object.keys(organisation)).have.all.members([
        '_id',
        'answers',
        'createdAt',
        'email',
        'nations',
        'orgId',
        'orgName',
        'rawSubmissionData',
        'schemaVersion'
      ])
      expect(organisation.orgName).to.equal(expectedOrgName)
      expect(organisation.orgId).to.equal(parseInt(expectedOrgId))
      expect(organisation.schemaVersion).to.equal(1)
      expect(organisation.answers.length).to.equal(13)
      expect(JSON.stringify(organisation.rawSubmissionData.meta)).to.equal(
        JSON.stringify(this.payload.meta)
      )
      expect(JSON.stringify(organisation.rawSubmissionData.data)).to.equal(
        JSON.stringify(this.payload.data)
      )
      expect(organisation.answers[1].value).to.equal(this.organisation.role)
      expect(organisation.answers[2].value).to.equal(this.organisation.fullName)
      expect(organisation.answers[3].value).to.equal(this.organisation.email)
      expect(organisation.answers[4].value).to.equal(
        this.organisation.phoneNumber
      )
    } else {
      logger.warn(
        {
          step_definition:
            'Then I should see that an organisation details is created in the database'
        },
        'Skipping organisation details database checks'
      )
    }
  }
)
