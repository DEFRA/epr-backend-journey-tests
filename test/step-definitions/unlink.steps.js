import { Then, When } from '@cucumber/cucumber'
import { expect } from 'chai'
import { authClient, eprBackendAPI } from '../support/hooks.js'

When('I unlink the recently migrated organisation', async function () {
  const organisationId = this.orgResponseData?.referenceNumber

  this.response = await eprBackendAPI.delete(
    `/v1/organisations/${organisationId}/link`,
    authClient.authHeader()
  )
})

Then('the organisation is unlinked successfully', function () {
  expect(this.response.statusCode).to.equal(204)
})

Then('the organisation link succeeds', function () {
  expect(this.response.statusCode).to.equal(200)
})
