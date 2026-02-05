import { When, Then } from '@cucumber/cucumber'
import { expect } from 'chai'
import { eprBackendAPI, defraIdStub } from '../support/hooks.js'

When('I create a PRN with the following details', async function (dataTable) {
  this.payload = dataTable.rowsHash()
  const prnPayload = {
    issuedToOrganisation: {
      id: this.payload.organisationId,
      name: this.payload.name,
      tradingName: this.payload.tradingName
    },
    tonnage: this.payload.tonnage,
    material: this.payload.material
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
  const regex = new RegExp(`^${prefix}\\d{6,8}$`)
  expect(this.prnNumber).to.match(regex)
})
