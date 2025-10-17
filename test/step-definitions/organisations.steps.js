import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from 'chai'
import { baseAPI } from '../support/hooks.js'

Given('I have access to the get organisations endpoint', function () {})

When('I request the organisations', async function () {
  this.response = await baseAPI.get('/v1/organisations')
})

Then('I should receive a valid organisations response', async function () {
  expect(this.response.statusCode).to.equal(200)
})
