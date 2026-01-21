import { Given, Then, When } from '@cucumber/cucumber'
import { baseAPI } from '../support/hooks.js'
import { expect } from 'chai'
import {
  Accreditation,
  Organisation,
  Registration
} from '../support/generator.js'

Given(
  `I create a linked and migrated organisation for the following`,
  async function (dataTable) {
    const dataRows = dataTable.hashes()

    this.organisation = new Organisation()
    this.payload = ''
    if (dataRows[0].wasteProcessingType === 'Reprocessor') {
      this.payload = this.organisation.toNonRegisteredUKSoleTraderPayload()
    } else {
      this.payload = this.organisation.toPayload()
    }

    this.response = await baseAPI.post(
      '/v1/apply/organisation',
      JSON.stringify(this.payload)
    )
    expect(this.response.statusCode).to.equal(200)

    this.orgResponseData = await this.response.body.json()

    const orgId = this.orgResponseData?.orgId
    const refNo = this.orgResponseData?.referenceNumber

    for (const dataRow of dataRows) {
      this.material = 'Paper or board (R3)'
      if (dataRow.material !== '') {
        this.material = dataRow.material
      }

      this.accreditation = new Accreditation(orgId, refNo)
      this.payload =
        dataRow.wasteProcessingType === 'Reprocessor'
          ? this.accreditation.toReprocessorPayload(this.material)
          : this.accreditation.toExporterPayload(this.material)

      this.response = await baseAPI.post(
        '/v1/apply/accreditation',
        JSON.stringify(this.payload)
      )
      expect(this.response.statusCode).to.equal(201)

      this.registration = new Registration(orgId, refNo)
      this.payload =
        dataRow.wasteProcessingType === 'Reprocessor'
          ? this.registration.toAllMaterialsPayload(this.material)
          : this.registration.toExporterPayload(this.material)

      this.response = await baseAPI.post(
        '/v1/apply/registration',
        JSON.stringify(this.payload)
      )
      expect(this.response.statusCode).to.equal(201)
    }

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
