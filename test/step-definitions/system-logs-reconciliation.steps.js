import { Then, When } from '@cucumber/cucumber'
import { expect } from 'chai'
import { authClient, defraIdStub, eprBackendAPI } from '../support/hooks.js'

When('the user discovers their organisations', async function () {
  this.response = await eprBackendAPI.get(
    '/v1/me/organisations',
    defraIdStub.authHeader(this.userId)
  )
})

Then(`the response status code is {int}`, async function (statusCode) {
  expect(this.response.statusCode).to.equal(statusCode)
  this.responseData = await this.response.body.json()
})

When(
  `I search system logs for the user with sub-category {string}`,
  async function (subCategory) {
    const query = new URLSearchParams({
      userId: this.userId,
      subCategory
    })
    this.response = await eprBackendAPI.get(
      `/v1/system-logs/search?${query}`,
      authClient.authHeader()
    )
    expect(this.response.statusCode).to.equal(200)
    this.systemLogsResponse = await this.response.body.json()
  }
)

Then('I receive exactly {int} system log(s)', function (count) {
  expect(this.systemLogsResponse.systemLogs).to.have.lengthOf(count)
})

Then('the system log event action is {string}', function (action) {
  const [log] = this.systemLogsResponse.systemLogs
  expect(log.event.action).to.equal(action)
})

Then('the system log context includes a linked organisation', function () {
  const [log] = this.systemLogsResponse.systemLogs
  expect(log.context.linked).to.not.equal(null)
  expect(log.context.linked).to.have.property('id')
  expect(log.context.linked).to.have.property('name')
  expect(log.context.linked).to.have.property('orgId')
  expect(log.context.linked).to.have.property('status')
  expect(log.context.linked).to.have.property('linkedBy')
  expect(log.context.linked).to.have.property('linkedAt')
  expect(log.context.defraIdOrg).to.have.property('id')
  expect(log.context.defraIdOrg).to.have.property('name')
  expect(log.context.defraIdRelationships).to.have.lengthOf.at.least(1)
})
