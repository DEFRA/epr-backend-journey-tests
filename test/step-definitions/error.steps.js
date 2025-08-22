import { Given, Then } from '@cucumber/cucumber'
import { expect } from 'chai'

Given('I have not entered any details', function () {
  this.payload = null
})

Given('I have entered invalid details', function () {
  this.payload = 'invalid-data'
})

Then('I should receive an error response', async function () {
  expect(this.response.statusCode).to.equal(400)
  const responseData = await this.response.body.json()
  expect(responseData).to.have.property('message')
  expect(responseData.message).to.equal('Invalid payload — must be JSON object')
})

Then(
  'I should receive an error response {string}',
  async function (errMessage) {
    expect(this.response.statusCode).to.equal(400)
    const responseData = await this.response.body.json()
    expect(responseData).to.have.property('message')
    expect(responseData.message).to.equal(errMessage)
  }
)
