import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from 'chai'
import { BaseAPI } from '../apis/base-api.js'
import regPayload from '../fixtures/registration.json' with { type: 'json' }
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

const suppliers = [
  'local council collections',
  'direct from producer',
  'material recovery facility'
]

const permitTypes = [
  'Waste management licence or environmental permit',
  'Installation permit or Pollution Prevention and Control (PPC) permit',
  'Waste exemption'
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

  const materialIndex = Math.floor(Math.random() * materials.length)
  const material = materials[materialIndex]
  const suppIndex = Math.floor(Math.random() * suppliers.length)
  const supplier = suppIndex[suppIndex]
  const permitIndex = Math.floor(Math.random() * permitTypes.length)
  const permitType = permitTypes[permitIndex]

  const wasteRegNo =
    'CBDU' + fakerEN_GB.number.int({ min: 100000, max: 999999 })
  const permitNo = `${fakerEN_GB.number.int({ min: 1000000000, max: 9999999999 })}`
  const port = fakerEN_GB.location.city()

  const address =
    fakerEN_GB.location.streetAddress() +
    ',' +
    fakerEN_GB.location.city() +
    ',' +
    fakerEN_GB.location.zipCode()

  payload.data.main.CzNRVZ = fullName
  payload.data.main.xpDUqn = email
  payload.data.main.ZgTfLO = phoneNumber
  payload.data.main.aSKIDS = jobTitle

  payload.data.main.NOwTKr = fullName
  payload.data.main.rYgNmR = email
  payload.data.main.inueIm = phoneNumber
  payload.data.main.MdZwoU = jobTitle

  payload.data.main.RPiGkV = fullName
  payload.data.main.eSxaKY = email
  payload.data.main.AkoyKd = phoneNumber
  payload.data.main.mGpVDA = jobTitle

  payload.data.main.RIXIzA = refNo
  payload.data.main.QnSRcX = orgId

  payload.data.main.BeHQjA = material

  payload.data.main.pGYoub = address
  payload.data.main.fubWwR = wasteRegNo
  payload.data.main.CACJrG = permitNo
  payload.data.main.vsaLhJ = supplier
  payload.data.main.QHJFhL = permitType

  payload.data.repeaters.GzScMv[0].ZcjmuP = port

  payload.data.files.qEZeYC[0].fileId = fileId1
  payload.data.files.qEZeYC[0].userDownloadLink = `https://forms-designer.test.cdp-int.defra.cloud/file-download/${fileId1}`
  payload.data.files.uUWjUW[0].fileId = fileId2
  payload.data.files.uUWjUW[0].userDownloadLink = `https://forms-designer.test.cdp-int.defra.cloud/file-download/${fileId2}`

  return payload
}

Given('I have entered my registration details', function () {
  this.payload = randomiseData(regPayload)
})

Given(
  'I have entered my registration details without pages metadata',
  function () {
    this.payload = randomiseData(regPayload)
    delete this.payload.meta.definition.pages
  }
)

Given('I have entered my registration details without data', function () {
  this.payload = randomiseData(regPayload)
  delete this.payload.data
})

Given(
  'I have entered my registration details without organisation ID',
  function () {
    this.payload = randomiseData(regPayload)
    delete this.payload.data.main.QnSRcX
  }
)

Given(
  'I have entered my registration details without reference number',
  function () {
    this.payload = randomiseData(regPayload)
    delete this.payload.data.main.RIXIzA
  }
)

Given(
  'I have entered my registration details with orgId value of {string}',
  function (orgId) {
    this.payload = randomiseData(regPayload)
    this.payload.data.main.QnSRcX = orgId
  }
)

Given(
  'I have entered my registration details with reference number value of {string}',
  function (refNo) {
    this.payload = randomiseData(regPayload)
    this.payload.data.main.RIXIzA = refNo
  }
)

When('I submit the registration details', async function () {
  this.response = await baseAPI.post(
    '/v1/apply/registration',
    JSON.stringify(this.payload)
  )
})

Then(
  'I should receive a registration resource created response',
  async function () {
    expect(this.response.statusCode).to.equal(201)
  }
)
