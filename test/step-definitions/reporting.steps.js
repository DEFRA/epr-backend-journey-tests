import { When, Then } from '@cucumber/cucumber'
import { defraIdStub, eprBackendAPI } from '../support/hooks.js'
import { expect } from 'chai'

When(
  'I retrieve the {string} report for the year {int} and period {int}',
  async function (cadence, year, period) {
    this.response = await eprBackendAPI.get(
      `/v1/organisations/${this.organisationId}/registrations/${this.registrationId}/reports/${year}/${cadence}/${period}`,
      defraIdStub.authHeader(this.userId)
    )
  }
)

Then('the report is successfully retrieved', async function () {
  expect(this.response.statusCode).to.equal(200)
})

Then(
  'the report contains the following information',
  async function (dataTable) {
    const expectedData = dataTable.hashes()
    const reportData = await this.response.body.json()

    function normalise(value) {
      if (typeof value !== 'number') return value
      return Number.isInteger(value) ? parseInt(value) : value.toFixed(2)
    }

    for (const expectation of expectedData) {
      const actualValue = expectation.Key.split('.').reduce(
        (acc, key) => acc?.[key],
        reportData
      )
      expect(normalise(actualValue)).to.equal(
        Number.isInteger(actualValue)
          ? parseInt(expectation.Value)
          : expectation.Value
      )
    }
  }
)

When(
  'I create the report for the year {int} and period {int}',
  async function (year, period) {
    this.response = await eprBackendAPI.post(
      `/v1/organisations/${this.organisationId}/registrations/${this.registrationId}/reports/${year}/monthly/${period}`,
      '',
      defraIdStub.authHeader(this.userId)
    )
  }
)

Then('the report is successfully created', async function () {
  expect(this.response.statusCode).to.equal(201)
})

When(
  'I patch the {string} report for the year {int} and period {int} with',
  async function (cadence, year, period, dataTable) {
    const fields = dataTable.rowsHash()
    const payload = {}

    for (const [key, value] of Object.entries(fields)) {
      payload[key] = isNaN(value) ? value : Number(value)
    }

    this.response = await eprBackendAPI.patch(
      `/v1/organisations/${this.organisationId}/registrations/${this.registrationId}/reports/${year}/${cadence}/${period}`,
      JSON.stringify(payload),
      defraIdStub.authHeader(this.userId)
    )
  }
)

When(
  'I patch the {string} report for the year {int} and period {int} with empty body',
  async function (cadence, year, period) {
    this.response = await eprBackendAPI.patch(
      `/v1/organisations/${this.organisationId}/registrations/${this.registrationId}/reports/${year}/${cadence}/${period}`,
      JSON.stringify({}),
      defraIdStub.authHeader(this.userId)
    )
  }
)

Then('the report patch succeeds', async function () {
  expect(this.response.statusCode).to.equal(200)
  this.patchedReportData = await this.response.body.json()
})

Then(
  'the patched report contains the following information',
  async function (dataTable) {
    const expectedData = dataTable.hashes()

    for (const expectation of expectedData) {
      const actualValue = expectation.Key.split('.').reduce(
        (acc, key) => acc?.[key],
        this.patchedReportData
      )

      const expectedValue = isNaN(expectation.Value)
        ? expectation.Value
        : Number(expectation.Value)

      if (
        typeof actualValue === 'number' &&
        typeof expectedValue === 'number'
      ) {
        expect(actualValue).to.equal(expectedValue)
      } else {
        expect(String(actualValue)).to.equal(String(expectedValue))
      }
    }
  }
)
