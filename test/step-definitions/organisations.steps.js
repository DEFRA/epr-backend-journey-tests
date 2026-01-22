import { Given, Then, When } from '@cucumber/cucumber'
import { expect } from 'chai'
import { authClient, baseAPI } from '../support/hooks.js'
import { Organisations } from '../support/generator.js'
import { fakerEN_GB } from '@faker-js/faker'

Given('I have access to the get organisations endpoint', function () {})
Given('I try to access the get organisations endpoint', function () {})

Given('I have access to the put organisations endpoint', function () {})

When(
  'I update the recently migrated organisations data with the following data',
  async function (dataTable) {
    const orgId = this.orgResponseData?.referenceNumber
    this.response = await baseAPI.get(
      `/v1/organisations/${orgId}`,
      authClient.authHeader()
    )

    this.responseData = await this.response.body.json()

    const updateDataRows = dataTable.hashes()
    const currentYear = new Date().getFullYear()

    let data = this.responseData

    this.registrationIds = new Map()
    this.accreditationIds = new Map()

    for (let i = 0; i < updateDataRows.length; i++) {
      const orgUpdateData = updateDataRows[i]
      data.registrations[i].status = orgUpdateData.status
      data.registrations[i].validFrom = '2025-01-01'
      data.registrations[i].validTo = `${currentYear + 1}-01-01`
      if (orgUpdateData.reprocessingType !== '') {
        data.registrations[i].reprocessingType = orgUpdateData.reprocessingType
      }
      if (orgUpdateData.glassRecyclingProcess !== '') {
        data.registrations[i].glassRecyclingProcess =
          orgUpdateData.glassRecyclingProcess
            .split(',')
            .map((item) => item.trim())
      }
      data.registrations[i].registrationNumber = orgUpdateData.regNumber
      data.registrations[i].accreditationId = data.accreditations[i].id
      data.accreditations[i].status = orgUpdateData.status
      data.accreditations[i].validFrom = '2025-01-01'
      data.accreditations[i].validTo = `${currentYear + 1}-01-01`
      if (orgUpdateData.reprocessingType !== '') {
        data.accreditations[i].reprocessingType = orgUpdateData.reprocessingType
      }
      if (orgUpdateData.glassRecyclingProcess !== '') {
        data.accreditations[i].glassRecyclingProcess =
          orgUpdateData.glassRecyclingProcess
            .split(',')
            .map((item) => item.trim())
      }
      data.accreditations[i].accreditationNumber = orgUpdateData.accNumber

      this.registrationIds.set(
        orgUpdateData.regNumber,
        data.registrations[i].id
      )
      this.accreditationIds.set(
        orgUpdateData.accNumber,
        data.accreditations[i].id
      )
    }

    if (updateDataRows[0].email) {
      this.email = updateDataRows[0].email
    } else {
      // Replace email address with a newly generated one in Environment to avoid same email address all the time
      this.email = process.env.ENVIRONMENT
        ? fakerEN_GB.internet.email()
        : data.submitterContactDetails.email
      data.submitterContactDetails.email = this.email
    }

    data.status = updateDataRows[0].status

    this.registrationId = data.registrations[0].id
    this.accreditationId = data.accreditations[0].id
    this.organisationId = orgId

    data = { organisation: data }

    this.response = await baseAPI.patch(
      `/v1/dev/organisations/${orgId}`,
      JSON.stringify(data)
    )
  }
)

When('I request the organisations', async function () {
  this.response = await baseAPI.get(
    '/v1/organisations',
    authClient.authHeader()
  )
})

When('I request the recently migrated organisation', async function () {
  const orgId = this.orgResponseData?.referenceNumber
  this.response = await baseAPI.get(
    `/v1/organisations/${orgId}`,
    authClient.authHeader()
  )
})

When('I request the organisations with id {string}', async function (orgId) {
  this.response = await baseAPI.get(
    `/v1/organisations/${orgId}`,
    authClient.authHeader()
  )
})

When('I update the organisations with id {string}', async function (orgId) {
  this.payload = {}
  this.response = await baseAPI.put(
    `/v1/organisations/${orgId}`,
    JSON.stringify(this.payload),
    authClient.authHeader()
  )
})

When(
  'I update the organisations with id {string} with the following payload',
  async function (orgId, dataTable) {
    this.organisations = new Organisations()
    this.payload = dataTable.rowsHash()

    if (!this.payload.version) {
      this.payload.version = this.version
    }

    if (this.payload.updateFragment === 'sample-fixture') {
      this.payload = this.organisations.toDefaultPayload(this.payload)
    } else if (this.payload.updateFragment === 'response-data') {
      this.payload.updateFragment = this.responseData
      this.payload = this.organisations.toPayload(this.payload)
    } else {
      this.payload = this.organisations.toPayload(this.payload)
    }

    this.response = await baseAPI.put(
      `/v1/organisations/${orgId}`,
      JSON.stringify(this.organisations.toPayload(this.payload)),
      authClient.authHeader()
    )
  }
)
When(
  'I update the recently migrated organisation with the following payload',
  async function (dataTable) {
    const orgId = this.orgResponseData?.referenceNumber

    this.organisations = new Organisations()
    this.payload = dataTable.rowsHash()

    if (!this.payload.version) {
      this.payload.version = this.version
    }

    if (this.payload.updateFragment === 'sample-fixture') {
      this.payload = this.organisations.toDefaultPayload(this.payload)
    } else if (this.payload.updateFragment === 'response-data') {
      this.payload.updateFragment = this.responseData
      this.payload = this.organisations.toPayload(this.payload)
    } else {
      this.payload = this.organisations.toPayload(this.payload)
    }

    this.response = await baseAPI.put(
      `/v1/organisations/${orgId}`,
      JSON.stringify(this.organisations.toPayload(this.payload)),
      authClient.authHeader()
    )
  }
)

Then('I should receive a valid organisations response', async function () {
  expect(this.response.statusCode).to.equal(200)
})

Then(
  'I should receive a successful update organisations response',
  async function () {
    expect(this.response.statusCode).to.equal(200)
  }
)

Then(
  'I should receive a valid organisations response for the recently migrated organisation',
  async function () {
    expect(this.response.statusCode).to.equal(200)
    this.responseData = await this.response.body.json()
    this.version = this.responseData.version

    const id = this.orgResponseData?.referenceNumber
    expect(this.responseData.id).to.equal(id)
  }
)

Then(
  'I should receive a valid organisations response for {string}',
  async function (id) {
    expect(this.response.statusCode).to.equal(200)
    this.responseData = await this.response.body.json()
    this.version = this.responseData.version

    expect(this.responseData.id).to.equal(id)
  }
)

Then(
  'I should see the following users in the organisations response',
  async function (dataTable) {
    const expectedResults = dataTable.hashes()
    for (const expectedResult of expectedResults) {
      const matchingRow = this.responseData.users.find((row) => {
        return (
          row.fullName === expectedResult['Full Name'] &&
          row.email === expectedResult.Email &&
          row.roles.join(',') === expectedResult.Roles
        )
      })

      if (!matchingRow) {
        expect.fail(
          `Expected user ${JSON.stringify(expectedResult)} but no user found with those values. Actual users values found: ${JSON.stringify(this.responseData.users)}`
        )
      }
    }
  }
)
