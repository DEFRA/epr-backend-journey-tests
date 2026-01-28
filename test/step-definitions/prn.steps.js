import { When, Then } from '@cucumber/cucumber'
import { expect } from 'chai'
import { baseAPI, defraIdStub } from '../support/hooks.js'

When('I create a PRN with the following details', async function (dataTable) {
  this.payload = dataTable.rowsHash()
  this.response = await baseAPI.post(
    `/v1/organisations/${this.organisationId}/registrations/${this.registrationId}/packaging-recycling-notes`,
    JSON.stringify(this.payload),
    defraIdStub.authHeader(this.userId)
  )
})

Then('the PRN is successfully created', async function () {
  expect(this.response.statusCode).to.equal(201)
  this.prnCreationResponse = await this.response.body.json()
  this.prnId = this.prnCreationResponse.id
})

When('I update the PRN status to {string}', async function (status) {
  this.response = await baseAPI.post(
    `/v1/organisations/${this.organisationId}/registrations/${this.registrationId}/packaging-recycling-notes/${this.prnId}/status`,
    JSON.stringify({ status }),
    defraIdStub.authHeader(this.userId)
  )
})

Then('the PRN status is updated successfully', async function () {
  expect(this.response.statusCode).to.equal(200)
  this.prnCreationResponse = await this.response.body.json()
  this.prnId = this.prnCreationResponse.id
})
