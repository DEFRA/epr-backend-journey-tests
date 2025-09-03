import { fakerEN_GB } from '@faker-js/faker'

import accPayload from '../fixtures/accreditation.json' with { type: 'json' }
import orgPayload from '../fixtures/organisation.json' with { type: 'json' }
import regPayload from '../fixtures/registration.json' with { type: 'json' }

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
const roles = ['Reprocessor', 'Exporter', 'Reprocessor and exporter']
const nations = ['England', 'Northern Ireland', 'Scotland', 'Wales']

export function generateAccreditation() {
  const payload = JSON.parse(JSON.stringify(accPayload))

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

export function generateOrganisation() {
  const payload = JSON.parse(JSON.stringify(orgPayload))

  const phoneNumber = fakerEN_GB.phone.number()
  const fullName = fakerEN_GB.person.fullName()
  const email = fakerEN_GB.internet.email()
  const jobTitle = fakerEN_GB.person.jobTitle()

  const address =
    fakerEN_GB.location.streetAddress() +
    ',' +
    fakerEN_GB.location.city() +
    ',' +
    fakerEN_GB.location.zipCode()

  const companyName = fakerEN_GB.company.name() + ' Limited'

  const roleIndex = Math.floor(Math.random() * roles.length)
  const role = roles[roleIndex]
  const numberOfNations = Math.floor(Math.random() * nations.length) + 1

  payload.data.main.BYtjnh = fullName
  payload.data.main.aSoxDO = email
  payload.data.main.aIFHXo = phoneNumber
  payload.data.main.LyeSzH = jobTitle
  payload.data.main.WVADkQ = role
  payload.data.main.JbEBvr = companyName
  payload.data.main.QdhMJS = companyName
  payload.data.main.VcdRNr = nations.slice(0, numberOfNations).join(', ')
  payload.data.main.VATjEi = address

  return payload
}

export function generateRegistration() {
  const payload = JSON.parse(JSON.stringify(regPayload))

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
