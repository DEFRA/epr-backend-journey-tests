import { When, Then } from '@cucumber/cucumber'
import { baseAPI, authClient } from '../support/hooks.js'
import { expect } from 'chai'

When('I request the tonnage material', async function () {
  this.response = await baseAPI.get(
    '/v1/tonnage-monitoring',
    authClient.authHeader()
  )
})

Then('the tonnage material information should be correct', async function () {
  const tonnageMaterial = await this.response.body.json()
  const expectedMaterials = [
    'aluminium',
    'fibre',
    'glass',
    'paper',
    'plastic',
    'steel',
    'wood'
  ]
  const materials = tonnageMaterial.materials
  const actualMaterials = materials.map((m) => m.material)
  expect(actualMaterials.sort()).to.have.members(expectedMaterials.sort())

  const actualTonnages = materials.map((m) => m.totalTonnage)
  actualTonnages.forEach((totalTonnage) => {
    expect(totalTonnage).to.be.greaterThanOrEqual(0)
  })

  const calculatedTotal = materials.reduce((sum, m) => sum + m.totalTonnage, 0)
  expect(Math.abs(tonnageMaterial.total - calculatedTotal)).to.be.lessThan(0.01)
  expect(tonnageMaterial.total).to.be.greaterThanOrEqual(0)
})
