import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from 'chai'
import { baseAPI } from '../support/hooks.js'
import { Organisations } from '../support/generator.js'

Given('I have access to the get organisations endpoint', function () {})

Given('I have access to the put organisations endpoint', function () {})

When('I request the organisations', async function () {
  this.response = await baseAPI.get('/v1/organisations')
})

When('I request the organisations with id {string}', async function (orgId) {
  this.response = await baseAPI.get(`/v1/organisations/${orgId}`)
})

When('I update the organisations with id {string}', async function (orgId) {
  this.payload = {}
  this.response = await baseAPI.put(
    `/v1/organisations/${orgId}`,
    JSON.stringify(this.payload)
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
    } else {
      this.payload = this.organisations.toPayload(this.payload)
    }

    this.response = await baseAPI.put(
      `/v1/organisations/${orgId}`,
      JSON.stringify(this.organisations.toPayload(this.payload))
    )
  }
)

Then('I should receive a valid organisations response', async function () {
  expect(this.response.statusCode).to.equal(200)
})

Then(
  'I should receive a successful update organisations response',
  async function () {
    expect(this.response.statusCode).to.equal(204)
  }
)

Then(
  'I should receive a valid organisations response for {string}',
  async function (orgId) {
    expect(this.response.statusCode).to.equal(200)
    this.responseData = await this.response.body.json()

    this.version = this.responseData.version
  }
)
