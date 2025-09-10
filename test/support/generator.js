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

export class Accreditation {
  constructor() {
    this.phoneNumber = fakerEN_GB.phone.number()
    this.fullName = fakerEN_GB.person.fullName()
    this.email = fakerEN_GB.internet.email()
    this.refNo = fakerEN_GB.database.mongodbObjectId()
    this.orgId = `${fakerEN_GB.number.int({ min: 500000, max: 999999 })}`
    this.jobTitle = fakerEN_GB.person.jobTitle()

    this.fileId1 = fakerEN_GB.string.uuid()
    this.fileId2 = fakerEN_GB.string.uuid()

    this.reproPercentage = `${fakerEN_GB.number.int({ min: 10, max: 100 })}`
    this.priceSupportPercentage = `${fakerEN_GB.number.int({ min: 10, max: 100 })}`
    this.businessSupportPercentage = `${fakerEN_GB.number.int({ min: 10, max: 100 })}`
    this.commsPercentage = `${fakerEN_GB.number.int({ min: 10, max: 100 })}`
    this.developingNewMarketsPercentage = `${fakerEN_GB.number.int({ min: 1, max: 40 })}`
    this.developingNewUsesPercentage = `${fakerEN_GB.number.int({ min: 1, max: 30 })}`
    this.otherCategoriesPercentage = `${fakerEN_GB.number.int({ min: 1, max: 20 })}`

    const materialIndex = Math.floor(Math.random() * materials.length)
    this.material = materials[materialIndex]
    const tonnageBandIndex = Math.floor(Math.random() * tonnageBands.length)
    this.tonnageBand = tonnageBands[tonnageBandIndex]
  }

  toPayload() {
    const payload = JSON.parse(JSON.stringify(accPayload))

    payload.data.main.WGGxRc = this.fullName
    payload.data.main.qeJOQY = this.email
    payload.data.main.xyQDVo = this.phoneNumber
    payload.data.main.NQtVfy = this.jobTitle
    payload.data.main.MyWHms = this.refNo
    payload.data.main.Ooierc = this.orgId
    payload.data.main.qkCaCh = this.material
    payload.data.main.XKWebf = this.tonnageBand

    payload.data.main.yzvIcu = this.reproPercentage
    payload.data.main.vjegvC = this.priceSupportPercentage
    payload.data.main.gGuncQ = this.businessSupportPercentage
    payload.data.main.jqvpTT = this.commsPercentage
    payload.data.main.lACgrU = this.developingNewMarketsPercentage
    payload.data.main.gBpCMU = this.developingNewUsesPercentage
    payload.data.main.czCOzR = this.otherCategoriesPercentage

    payload.data.repeaters.QkZUNV[0].jiMeVj = this.fullName
    payload.data.repeaters.QkZUNV[0].eWxRYL = this.email
    payload.data.repeaters.QkZUNV[0].NRkpFI = this.phoneNumber
    payload.data.repeaters.QkZUNV[0].LUGryB = this.jobTitle
    payload.data.files.TJTMtQ[0].fileId = this.fileId1
    payload.data.files.TJTMtQ[0].userDownloadLink = `https://forms-designer.test.cdp-int.defra.cloud/file-download/${this.fileId1}`
    payload.data.files.zYxOlv[0].fileId = this.fileId2
    payload.data.files.zYxOlv[0].userDownloadLink = `https://forms-designer.test.cdp-int.defra.cloud/file-download/${this.fileId2}`

    return payload
  }
}

export class Organisation {
  constructor() {
    this.phoneNumber = fakerEN_GB.phone.number()
    this.fullName = fakerEN_GB.person.fullName()
    this.email = process.env.ENVIRONMENT
      ? 'REEXServiceTeam@defra.gov.uk'
      : fakerEN_GB.internet.email()

    this.jobTitle = fakerEN_GB.person.jobTitle()

    this.address =
      fakerEN_GB.location.streetAddress() +
      ',' +
      fakerEN_GB.location.city() +
      ',' +
      fakerEN_GB.location.zipCode()

    this.companyName = fakerEN_GB.company.name() + ' Limited'

    const roleIndex = Math.floor(Math.random() * roles.length)
    this.role = roles[roleIndex]
    this.numberOfNations = Math.floor(Math.random() * nations.length) + 1
  }

  toPayload() {
    const payload = JSON.parse(JSON.stringify(orgPayload))

    payload.data.main.BYtjnh = this.fullName
    payload.data.main.aSoxDO = this.email
    payload.data.main.aIFHXo = this.phoneNumber
    payload.data.main.LyeSzH = this.jobTitle
    payload.data.main.WVADkQ = this.role
    payload.data.main.JbEBvr = this.companyName
    payload.data.main.QdhMJS = this.companyName
    payload.data.main.VcdRNr = nations.slice(0, this.numberOfNations).join(', ')
    payload.data.main.VATjEi = this.address

    return payload
  }
}

export class Registration {
  constructor() {
    this.phoneNumber = fakerEN_GB.phone.number()
    this.fullName = fakerEN_GB.person.fullName()
    this.email = fakerEN_GB.internet.email()
    this.refNo = fakerEN_GB.database.mongodbObjectId()
    this.orgId = `${fakerEN_GB.number.int({ min: 500000, max: 999999 })}`
    this.jobTitle = fakerEN_GB.person.jobTitle()

    this.fileId1 = fakerEN_GB.string.uuid()
    this.fileId2 = fakerEN_GB.string.uuid()

    const materialIndex = Math.floor(Math.random() * materials.length)
    this.material = materials[materialIndex]
    const suppIndex = Math.floor(Math.random() * suppliers.length)
    this.supplier = suppIndex[suppIndex]
    const permitIndex = Math.floor(Math.random() * permitTypes.length)
    this.permitType = permitTypes[permitIndex]

    this.wasteRegNo =
      'CBDU' + fakerEN_GB.number.int({ min: 100000, max: 999999 })
    this.permitNo = `${fakerEN_GB.number.int({ min: 1000000000, max: 9999999999 })}`
    this.port = fakerEN_GB.location.city()

    this.address =
      fakerEN_GB.location.streetAddress() +
      ',' +
      fakerEN_GB.location.city() +
      ',' +
      fakerEN_GB.location.zipCode()
  }

  toPayload() {
    const payload = JSON.parse(JSON.stringify(regPayload))
    payload.data.main.CzNRVZ = this.fullName
    payload.data.main.xpDUqn = this.email
    payload.data.main.ZgTfLO = this.phoneNumber
    payload.data.main.aSKIDS = this.jobTitle

    payload.data.main.NOwTKr = this.fullName
    payload.data.main.rYgNmR = this.email
    payload.data.main.inueIm = this.phoneNumber
    payload.data.main.MdZwoU = this.jobTitle

    payload.data.main.RPiGkV = this.fullName
    payload.data.main.eSxaKY = this.email
    payload.data.main.AkoyKd = this.phoneNumber
    payload.data.main.mGpVDA = this.jobTitle

    payload.data.main.RIXIzA = this.refNo
    payload.data.main.QnSRcX = this.orgId

    payload.data.main.BeHQjA = this.material

    payload.data.main.pGYoub = this.address
    payload.data.main.fubWwR = this.wasteRegNo
    payload.data.main.CACJrG = this.permitNo
    payload.data.main.vsaLhJ = this.supplier
    payload.data.main.QHJFhL = this.permitType

    payload.data.repeaters.GzScMv[0].ZcjmuP = this.port

    payload.data.files.qEZeYC[0].fileId = this.fileId1
    payload.data.files.qEZeYC[0].userDownloadLink = `https://forms-designer.test.cdp-int.defra.cloud/file-download/${this.fileId1}`
    payload.data.files.uUWjUW[0].fileId = this.fileId2
    payload.data.files.uUWjUW[0].userDownloadLink = `https://forms-designer.test.cdp-int.defra.cloud/file-download/${this.fileId2}`

    return payload
  }
}
