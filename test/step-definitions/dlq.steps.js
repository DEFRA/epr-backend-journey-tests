import { Then, When } from '@cucumber/cucumber'
import { authClient, eprBackendAPI } from '../support/hooks.js'
import { expect } from 'chai'

When('I request the Admin DLQ purge', async function () {
  this.response = await eprBackendAPI.post(
    '/v1/admin/queues/dlq/purge',
    '',
    authClient.authHeader()
  )
})

Then('the request the to Admin DLQ purge succeeds', async function () {
  expect(this.response.statusCode).to.equal(200)
})
