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
  const materials = tonnageMonitoring.materials
  const actualMaterials = materials.map((m) => m.material)
  expect(actualMaterials.sort()).to.have.members(expectedMaterials.sort())

  const actualTonnages = materials.map((m) => m.totalTonnage)
  actualTonnages.forEach((totalTonnage) => {
    expect(totalTonnage).to.be.greaterThanOrEqual(0)
  })

  const calculatedTotal = materials.reduce((sum, m) => sum + m.totalTonnage, 0)
  expect(Math.abs(tonnageMonitoring.total - calculatedTotal)).to.be.lessThan(
    0.01
  )
  expect(tonnageMonitoring.total).to.be.greaterThanOrEqual(0)
})
