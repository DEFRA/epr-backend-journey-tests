import { Given, Then, When } from '@cucumber/cucumber'
import { baseAPI } from '../support/hooks.js'
import { expect } from 'chai'
import {
  Accreditation,
  Organisation,
  Registration
} from '../support/generator.js'

Given(
  `I create a linked and migrated organisation for {string}`,
  async function (orgType) {
    this.organisation = new Organisation()
    this.payload = ''
    if (orgType === 'Reprocessor') {
      this.payload = this.organisation.toNonRegisteredUKSoleTraderPayload()
    }
    this.response = await baseAPI.post(
      '/v1/apply/organisation',
      JSON.stringify(this.payload)
    )
    expect(this.response.statusCode).to.equal(200)

    this.orgResponseData = await this.response.body.json()

    const orgId = this.orgResponseData?.orgId
    const refNo = this.orgResponseData?.referenceNumber
    this.accreditation = new Accreditation(orgId, refNo)
    this.payload = this.accreditation.toReprocessorPayload()

    this.response = await baseAPI.post(
      '/v1/apply/accreditation',
      JSON.stringify(this.payload)
    )
    expect(this.response.statusCode).to.equal(201)

    this.registration = new Registration(orgId, refNo)
    this.payload = this.registration.toAllMaterialsPayload()

    this.response = await baseAPI.post(
      '/v1/apply/registration',
      JSON.stringify(this.payload)
    )
    expect(this.response.statusCode).to.equal(201)

    this.response = await baseAPI.post(
      `/v1/dev/form-submissions/${refNo}/migrate`,
      ''
    )
    expect(this.response.statusCode).to.equal(200)
  }
)

When('I migrate the form submissions organisations data', async function () {
  const refNo = this.orgResponseData?.referenceNumber
  this.response = await baseAPI.post(
    `/v1/dev/form-submissions/${refNo}/migrate`,
    ''
  )
})

Then('the form submissions organisations data is migrated', function () {
  expect(this.response.statusCode).to.equal(200)
})
