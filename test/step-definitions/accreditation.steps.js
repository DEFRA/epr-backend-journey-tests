import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from 'chai'
import { BaseAPI } from '../apis/base-api.js'
import accPayload from '../fixtures/accreditation.json' with { type: 'json' }
import { fakerEN_GB } from '@faker-js/faker'

const baseAPI = new BaseAPI()

const materials = [
  'Aluminium (R4)',
  'Fibre-based composite material (R3)',
  'Glass (R5)',
  'Paper or board (R3)',
  'Plastic (R3)',
  'Steel (R4)',
  'Wood (R3)'
]
const tonnageBands = [
  'Up to 500 tonnes',
  'Up to 5,000 tonnes',
  'Up to 10,000 tonnes',
  'Over 10,000 tonnes'
]

function randomiseData(payload) {
  payload = JSON.parse(JSON.stringify(payload))

  const phoneNumber = fakerEN_GB.phone.number()
  const fullName = fakerEN_GB.person.fullName()
  const email = fakerEN_GB.internet.email()
  const refNo = fakerEN_GB.database.mongodbObjectId()
  const orgId = `${fakerEN_GB.number.int({ min: 500000, max: 999999 })}`
  const jobTitle = fakerEN_GB.person.jobTitle()

  const fileId1 = fakerEN_GB.string.uuid()
  const fileId2 = fakerEN_GB.string.uuid()

  const reproPercentage = `${fakerEN_GB.number.int({ min: 10, max: 100 })}`
  const priceSupportPercentage = `${fakerEN_GB.number.int({ min: 10, max: 100 })}`
  const businessSupportPercentage = `${fakerEN_GB.number.int({ min: 10, max: 100 })}`
  const commsPercentage = `${fakerEN_GB.number.int({ min: 10, max: 100 })}`
  const developingNewMarketsPercentage = `${fakerEN_GB.number.int({ min: 1, max: 40 })}`
  const developingNewUsesPercentage = `${fakerEN_GB.number.int({ min: 1, max: 30 })}`
  const otherCategoriesPercentage = `${fakerEN_GB.number.int({ min: 1, max: 20 })}`

  const materialIndex = Math.floor(Math.random() * materials.length)
  const material = materials[materialIndex]
  const tonnageBandIndex = Math.floor(Math.random() * tonnageBands.length)
  const tonnageBand = tonnageBands[tonnageBandIndex]

  payload.data.main.WGGxRc = fullName
  payload.data.main.qeJOQY = email
  payload.data.main.xyQDVo = phoneNumber
  payload.data.main.NQtVfy = jobTitle
  payload.data.main.MyWHms = refNo
  payload.data.main.Ooierc = orgId
  payload.data.main.qkCaCh = material
  payload.data.main.XKWebf = tonnageBand

  payload.data.main.yzvIcu = reproPercentage
  payload.data.main.vjegvC = priceSupportPercentage
  payload.data.main.gGuncQ = businessSupportPercentage
  payload.data.main.jqvpTT = commsPercentage
  payload.data.main.lACgrU = developingNewMarketsPercentage
  payload.data.main.gBpCMU = developingNewUsesPercentage
  payload.data.main.czCOzR = otherCategoriesPercentage

  payload.data.repeaters.QkZUNV[0].jiMeVj = fullName
  payload.data.repeaters.QkZUNV[0].eWxRYL = email
  payload.data.repeaters.QkZUNV[0].NRkpFI = phoneNumber
  payload.data.repeaters.QkZUNV[0].LUGryB = jobTitle
  payload.data.files.TJTMtQ[0].fileId = fileId1
  payload.data.files.TJTMtQ[0].userDownloadLink = `https://forms-designer.test.cdp-int.defra.cloud/file-download/${fileId1}`
  payload.data.files.zYxOlv[0].fileId = fileId2
  payload.data.files.zYxOlv[0].userDownloadLink = `https://forms-designer.test.cdp-int.defra.cloud/file-download/${fileId2}`

  return payload
}

Given('I have entered my accreditation details', function () {
  this.payload = randomiseData(accPayload)
})

Given(
  'I have entered my accreditation details without pages metadata',
  function () {
    this.payload = randomiseData(accPayload)
    delete this.payload.meta.definition.pages
  }
)

Given(
  'I have entered my accreditation details without organisation ID',
  function () {
    this.payload = randomiseData(accPayload)
    delete this.payload.data.main.Ooierc
  }
)

Given(
  'I have entered my accreditation details without reference number',
  function () {
    this.payload = randomiseData(accPayload)
    delete this.payload.data.main.MyWHms
  }
)

Given(
  'I have entered my accreditation details with orgId value of {string}',
  function (orgId) {
    this.payload = randomiseData(accPayload)
    this.payload.data.main.Ooierc = orgId
  }
)

Given(
  'I have entered my accreditation details with reference number value of {string}',
  function (refNo) {
    this.payload = randomiseData(accPayload)
    this.payload.data.main.MyWHms = refNo
  }
)

When('I submit the accreditation details', async function () {
  this.response = await baseAPI.post(
    '/v1/apply/accreditation',
    JSON.stringify(this.payload)
  )
})

Then(
  'I should receive an accreditation resource created response',
  async function () {
    expect(this.response.statusCode).to.equal(201)
  }
)
