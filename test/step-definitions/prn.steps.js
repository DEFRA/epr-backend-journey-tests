import { Then, When } from '@cucumber/cucumber'
import { expect } from 'chai'
import {
  cognitoAuth,
  defraIdStub,
  eprBackendAPI,
  interpolator
} from '../support/hooks.js'

When('I create a PRN with the following details', async function (dataTable) {
  this.payload = dataTable.rowsHash()
  const prnPayload = {
    issuedToOrganisation: {
      id: this.payload.organisationId,
      name: this.payload.name,
      tradingName: this.payload.tradingName
    },
    tonnage: this.payload.tonnage
  }
  this.response = await eprBackendAPI.post(
    `/v1/organisations/${this.organisationId}/registrations/${this.registrationId}/accreditations/${this.accreditationId}/packaging-recycling-notes`,
    JSON.stringify(prnPayload),
    defraIdStub.authHeader(this.userId)
  )
})

Then('the PRN is successfully created', async function () {
  expect(this.response.statusCode).to.equal(201)
  this.prnCreationResponse = await this.response.body.json()
  this.prnId = this.prnCreationResponse.id
})

When('I update the PRN status to {string}', async function (status) {
  this.response = await eprBackendAPI.post(
    `/v1/organisations/${this.organisationId}/registrations/${this.registrationId}/accreditations/${this.accreditationId}/packaging-recycling-notes/${this.prnId}/status`,
    JSON.stringify({ status }),
    defraIdStub.authHeader(this.userId)
  )
})

When('an external API rejects the PRN', async function () {
  this.response = await eprBackendAPI.post(
    `/v1/packaging-recycling-notes/${this.prnNumber}/reject`,
    JSON.stringify({ rejectedAt: new Date().toISOString() }),
    cognitoAuth.authHeader()
  )
})

When('an external API accepts the PRN', async function () {
  this.response = await eprBackendAPI.post(
    `/v1/packaging-recycling-notes/${this.prnNumber}/accept`,
    JSON.stringify({ acceptedAt: new Date().toISOString() }),
    cognitoAuth.authHeader()
  )
})

When('I retrieve the PRNs', async function () {
  this.response = await eprBackendAPI.get(
    `/v1/organisations/${this.organisationId}/registrations/${this.registrationId}/accreditations/${this.accreditationId}/packaging-recycling-notes`,
    defraIdStub.authHeader(this.userId)
  )
})

When(
  'an external API retrieves the PRN with status {string}',
  async function (status) {
    this.response = await eprBackendAPI.get(
      `/v1/packaging-recycling-notes?statuses=${status}`,
      cognitoAuth.authHeader()
    )
  }
)

Then('I see the following retrieved PRNs', async function (dataTable) {
  expect(this.response.statusCode).to.equal(200)
  const dataRows = dataTable.hashes()
  const prns = await this.response.body.json()
  expect(prns.length).to.equal(dataRows.length)
  for (const dataRow of dataRows) {
    let expectedPrnNumber = null
    if (dataRow['PRN Number']) {
      expectedPrnNumber = interpolator.interpolate(this, dataRow['PRN Number'])
    }
    const prn = prns.find((p) => p.prnNumber === expectedPrnNumber)
    if (!prn) {
      expect.fail(`PRN with PRN Number ${expectedPrnNumber} not found`)
    }
    expect(prn.status).to.equal(dataRow.Status)
    expect(prn.material).to.equal(dataRow.Material)
    expect(prn.tonnage).to.equal(parseInt(dataRow.Tonnage))
    expect(prn.issuedToOrganisation.id).to.equal(dataRow.OrganisationId)
    expect(prn.issuedToOrganisation.name).to.equal(dataRow.OrganisationName)
    expect(prn.issuedToOrganisation.tradingName).to.equal(dataRow.TradingName)
  }
})

Then(
  'the external API call to retrieve the PRN is successful and contains the PRN with PRN Number {string}',
  async function (prnNumber) {
    expect(this.response.statusCode).to.equal(200)
    const prns = await this.response.body.json()
    const expectedPrnNumber = interpolator.interpolate(this, prnNumber)
    const prn = prns.items.find((p) => p.prnNumber === expectedPrnNumber)
    if (!prn) {
      expect.fail(
        `PRN with PRN Number ${expectedPrnNumber} not found from the list`
      )
    }
  }
)

Then(
  'the external API call to update the PRN status is successful',
  async function () {
    expect(this.response.statusCode).to.equal(204)
  }
)

Then('the PRN status is updated successfully', async function () {
  expect(this.response.statusCode).to.equal(200)
  this.prnCreationResponse = await this.response.body.json()
  this.prnId = this.prnCreationResponse.id
})

Then('the PRN is issued successfully', async function () {
  expect(this.response.statusCode).to.equal(200)
  this.prnIssuedResponse = await this.response.body.json()
  this.prnId = this.prnIssuedResponse.id
  this.prnNumber = this.prnIssuedResponse.prnNumber
})

Then('the PRN number starts with {string}', async function (prefix) {
  const regex = new RegExp(`^${prefix}\\d{5,9}$`)
  expect(this.prnNumber).to.match(regex)
})
