import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from 'chai'
import { baseAPI } from '../support/hooks.js'

Given('I have access to the EPR backend endpoint', function () {})

When('I request the health check', async function () {
  this.response = await baseAPI.get('/health')
})

Then('I should receive the health check response', async function () {
  expect(this.response.statusCode).to.equal(200)
  const responseData = await this.response.body.json()
  expect(responseData).to.have.property('message')
  expect(responseData.message).to.equal('success')
})
