import { Given } from '@cucumber/cucumber'
import { authClient } from '../support/hooks.js'

Given('I am logged in as a service maintainer', async function () {
  const clientId = 'clientId'
  const username = 'ea@test.gov.uk'
  await authClient.signToken(clientId, username)
})

Given('I am logged in as a non-service maintainer', async function () {
  const clientId = 'clientId'
  const username = 'customer@test.gov.uk'
  await authClient.signToken(clientId, username)
})
