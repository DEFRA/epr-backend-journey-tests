import { When, Then } from '@cucumber/cucumber'
import { eprBackendAPI, authClient } from '../support/hooks.js'
import { expect } from 'chai'

When('I request the tonnage monitoring', async function () {
  this.response = await eprBackendAPI.get(
    '/v1/tonnage-monitoring',
    authClient.authHeader()
  )
})

Then('the tonnage monitoring information should be correct', async function () {
  const tonnageMonitoring = await this.response.body.json()
  const expectedMaterials = [
    'aluminium',
    'fibre',
    'glass_other',
    'glass_re_melt',
    'paper',
    'plastic',
    'steel',
    'wood'
  ]

  // Filter for material rows only (exclude total rows)
  const materialRows = tonnageMonitoring.materials.filter((m) => m.material)
  const actualMaterials = [...new Set(materialRows.map((m) => m.material))]
  expect(actualMaterials.sort()).to.have.members(expectedMaterials.sort())

  // Verify each material row has valid month tonnages
  materialRows.forEach((materialRow) => {
    expect(materialRow.months).to.be.an('array')
    materialRow.months.forEach((month) => {
      expect(month.tonnage).to.be.greaterThanOrEqual(0)
    })
  })
  expect(tonnageMonitoring.total).to.be.greaterThanOrEqual(0)
})
