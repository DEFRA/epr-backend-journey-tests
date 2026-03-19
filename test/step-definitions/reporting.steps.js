import { When, Then } from '@cucumber/cucumber'
import { defraIdStub, eprBackendAPI } from '../support/hooks.js'
import { expect } from 'chai'

When(
  'I retrieve the report for the year {int} and period {int}',
  async function (year, period) {
    this.response = await eprBackendAPI.get(
      `/v1/organisations/${this.organisationId}/registrations/${this.registrationId}/reports/${year}/${period}`,
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

    for (const expectation of expectedData) {
      const actualValue = expectation.Key.split('.').reduce(
        (acc, key) => acc?.[key],
        reportData
      )
      if (typeof actualValue === 'number' && !Number.isInteger(actualValue)) {
        expect(actualValue.toFixed(2)).to.equal(expectation.Value)
      } else {
        expect(actualValue).to.equal(expectation.Value)
      }
    }
  }
)
