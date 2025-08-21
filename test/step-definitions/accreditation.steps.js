import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from 'chai'
import { BaseAPI } from '../apis/base-api.js'

const baseAPI = new BaseAPI()

Given('I have entered my accreditation details', function () {
  this.details = {}
})

When('I submit the accreditation details', async function () {
  this.response = await baseAPI.post(
    '/v1/apply/accreditation',
    JSON.stringify(this.details)
  )
})

Then(
  'I should receive the following accreditation details response',
  async function () {
    expect(this.response.statusCode).to.equal(204)
  }
)
