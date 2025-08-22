import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from 'chai'
import { BaseAPI } from '../apis/base-api.js'

const baseAPI = new BaseAPI()

Given('I have entered my registration details', function () {
  this.payload = {}
})

When('I submit the registration details', async function () {
  this.response = await baseAPI.post(
    '/v1/apply/registration',
    JSON.stringify(this.payload)
  )
})

Then(
  'I should receive the following registration details response',
  async function () {
    expect(this.response.statusCode).to.equal(204)
  }
)
