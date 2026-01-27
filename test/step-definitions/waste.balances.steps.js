import { When, Then } from '@cucumber/cucumber'
import { baseAPI, defraIdStub, interpolator } from '../support/hooks.js'
import { expect } from 'chai'
import config from '../config/config.js'

When('I retrieve the waste balance for the organisation', async function () {
  this.response = await baseAPI.get(
    `/v1/organisations/${this.organisationId}/waste-balances?accreditationIds=${this.accreditationId}`,
    defraIdStub.authHeader(this.userId)
  )
})

Then(
  'I should see the following waste balance',
  { timeout: config.pollTimeout },
  async function (dataTable) {
    expect(this.response.statusCode).to.equal(200)

    const dataRows = dataTable.hashes()

    const timeout = config.pollTimeout
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      const wasteBalance = await this.response.body.json()

      if (Object.keys(wasteBalance).length === 0) {
        // Poll for Waste Balance if it is not available yet
        this.response = await baseAPI.get(
          `/v1/organisations/${this.organisationId}/waste-balances?accreditationIds=${this.accreditationId}`,
          defraIdStub.authHeader(this.userId)
        )
        await new Promise((resolve) => setTimeout(resolve, config.interval))
      } else {
        for (const dataRow of dataRows) {
          const actualBalance =
            wasteBalance[
              interpolator.interpolate(this, dataRow.AccreditationId)
            ]
          expect(parseFloat(actualBalance.amount).toFixed(2)).to.equal(
            parseFloat(dataRow.Amount).toFixed(2)
          )
          expect(parseFloat(actualBalance.availableAmount).toFixed(2)).to.equal(
            parseFloat(dataRow.AvailableAmount).toFixed(2)
          )
        }
        return
      }
    }
  }
)
