import { fakerEN_GB, fakerFR } from '@faker-js/faker'

import accPayload from '../fixtures/accreditation.json' with { type: 'json' }
import accReprocessorPayload from '../fixtures/ea/accreditation/reprocessor-paper.json' with { type: 'json' }
import orgPayload from '../fixtures/organisation.json' with { type: 'json' }
import orgUkSoleTraderPayload from '../fixtures/ea/organisation/non-registered-uk-sole-trader.json' with { type: 'json' }
import nonRegOutsideUkAddressPayload from '../fixtures/ea/organisation/non-registered-outside-uk-address.json' with { type: 'json' }
import regPayload from '../fixtures/registration.json' with { type: 'json' }
import regAllMaterialsPayload from '../fixtures/ea/registration/reprocessor-all-materials.json' with { type: 'json' }
import organisationsPayload from '../fixtures/sample-organisation-1.json' with { type: 'json' }

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
  constructor(orgId, refNo) {
    this.phoneNumber = fakerEN_GB.phone.number()
    this.fullName = fakerEN_GB.person.fullName()
    this.email = fakerEN_GB.internet.email()
    this.refNo = refNo || fakerEN_GB.database.mongodbObjectId()
    this.orgId = orgId
      ? `${orgId}`
      : `${fakerEN_GB.number.int({ min: 500000, max: 999999 })}`
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
    this.postcode = fakerEN_GB.location.zipCode()
  }

  toReprocessorPayload(
    material = 'Paper or board (R3)',
    glassRecyclingProcess = 'Both'
  ) {
    const payload = JSON.parse(JSON.stringify(accReprocessorPayload))

    this.material = material

    if (this.material === 'Glass (R5)') {
      payload.data.main.gQZpRd = glassRecyclingProcess
    }

    payload.data.main.PcYDad = this.fullName
    payload.data.main.ANtYzb = this.email
    payload.data.main.wQSslf = this.phoneNumber
    payload.data.main.UKfLjM = this.jobTitle
    payload.data.main.kiwNtq = this.refNo
    payload.data.main.BQWXPN = this.orgId
    payload.data.main.xBWNGE = this.tonnageBand

    payload.data.main.gYejUO = this.reproPercentage
    payload.data.main.WvPjhV = this.priceSupportPercentage
    payload.data.main.xydTTp = this.businessSupportPercentage
    payload.data.main.XKcgiV = this.commsPercentage
    payload.data.main.eAhuYs = this.developingNewMarketsPercentage
    payload.data.main.tJvMrh = this.developingNewUsesPercentage
    payload.data.main.LuybKn = this.otherCategoriesPercentage

    payload.data.main.IaTELm = this.material
    payload.data.main.gWdCTX = this.postcode

    payload.data.repeaters.kaaxig[0].aGZJEm = this.fullName
    payload.data.repeaters.kaaxig[0].oVQfjw = this.email
    payload.data.repeaters.kaaxig[0].qDGstU = this.phoneNumber
    payload.data.repeaters.kaaxig[0].QVIiRa = this.jobTitle

    payload.data.repeaters.kaaxig[1].aGZJEm = fakerEN_GB.person.fullName()
    payload.data.repeaters.kaaxig[1].oVQfjw = fakerEN_GB.internet.email()
    payload.data.repeaters.kaaxig[1].qDGstU = fakerEN_GB.phone.number()
    payload.data.repeaters.kaaxig[1].QVIiRa = fakerEN_GB.person.jobTitle()

    payload.data.files.zJwuYH[0].fileId = this.fileId1
    payload.data.files.zJwuYH[0].userDownloadLink = `https://forms-designer.test.cdp-int.defra.cloud/file-download/${this.fileId1}`

    return payload
  }

  toExporterPayload(
    material = 'Paper or board (R3)',
    glassRecyclingProcess = 'Both'
  ) {
    const payload = JSON.parse(JSON.stringify(accPayload))

    this.material = material

    if (this.material === 'Glass (R5)') {
      payload.data.main.WNTLmM = glassRecyclingProcess
    } else {
      delete payload.data.main.WNTLmM
    }

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
    this.email =
      process.env.ENVIRONMENT === 'test'
        ? process.env.EMAIL_ADDRESS
        : fakerEN_GB.internet.email()

    this.jobTitle = fakerEN_GB.person.jobTitle()

    this.postcode = fakerEN_GB.location.zipCode()
    this.address =
      fakerEN_GB.location.streetAddress() +
      ',' +
      fakerEN_GB.location.city() +
      ',' +
      this.postcode

    this.companyName = fakerEN_GB.company.name() + ' Limited'

    this.numberOfNations = Math.floor(Math.random() * nations.length) + 1
  }

  toNonRegisteredOutsideUKAddressPayload() {
    const payload = JSON.parse(JSON.stringify(nonRegOutsideUkAddressPayload))

    this.foreignCity = fakerFR.location.city()
    this.foreignCity = fakerFR.location.city()
    this.foreignAddress = fakerFR.location.streetAddress()

    payload.data.main.JiSlkT = fakerEN_GB.person.fullName()
    payload.data.main.BYtjnh = this.fullName
    payload.data.main.aSoxDO = this.email
    payload.data.main.aIFHXo = this.phoneNumber
    payload.data.main.LyeSzH = this.jobTitle
    payload.data.main.WkWBWB = this.companyName
    payload.data.main.xsDMEE = this.companyName
    payload.data.main.VcdRNr = nations.slice(0, this.numberOfNations).join(', ')
    payload.data.main.yhEOvK = this.foreignAddress
    payload.data.main.TUmXzj = this.foreignCity
    payload.data.main.PdFoDo = 'France'
    payload.data.main.oyAQgP = this.foreignCity
    payload.data.main.pAzIoG = fakerFR.location.zipCode()

    return payload
  }

  toNonRegisteredUKSoleTraderPayload() {
    const payload = JSON.parse(JSON.stringify(orgUkSoleTraderPayload))

    payload.data.main.JiSlkT = fakerEN_GB.person.fullName()
    payload.data.main.BYtjnh = this.fullName
    payload.data.main.aSoxDO = this.email
    payload.data.main.urKjHd = this.email
    payload.data.main.aIFHXo = this.phoneNumber
    payload.data.main.YXSHOs = fakerEN_GB.phone.number()
    payload.data.main.bCwGVt = this.jobTitle
    payload.data.main.JbEBvr = this.companyName
    payload.data.main.QdhMJS = this.companyName
    payload.data.main.VcdRNr = nations.slice(0, this.numberOfNations).join(', ')
    payload.data.main.VATjEi = this.address

    this.role = 'Reprocessor'

    return payload
  }

  toWithPartnershipPayload() {
    const payload = this.toPayload()
    payload.data.main.hnwFjT = 'A limited partnership'

    payload.data.repeaters = {
      CZFqEV: [
        {
          RXPSft: fakerEN_GB.person.firstName(),
          PEWtSm: 'Company partner'
        },
        {
          RXPSft: fakerEN_GB.person.firstName(),
          PEWtSm: 'Company partner'
        }
      ]
    }

    return payload
  }

  toPayload() {
    const payload = JSON.parse(JSON.stringify(orgPayload))

    const roleIndex = Math.floor(Math.random() * roles.length)
    this.role = roles[roleIndex]

    payload.data.main.BYtjnh = this.fullName
    payload.data.main.aSoxDO = this.email
    payload.data.main.aIFHXo = this.phoneNumber
    payload.data.main.LyeSzH = this.jobTitle
    payload.data.main.WVADkQ = this.role
    payload.data.main.RUKDyH = this.companyName
    payload.data.main.XcvvZV = this.companyName
    payload.data.main.VcdRNr = nations.slice(0, this.numberOfNations).join(', ')
    payload.data.main.VATjEi = this.address

    return payload
  }
}

export class Registration {
  constructor(
    orgId,
    refNo,
    streetAddress = fakerEN_GB.location.streetAddress()
  ) {
    this.phoneNumber = fakerEN_GB.phone.number()
    this.fullName = fakerEN_GB.person.fullName()
    this.email = fakerEN_GB.internet.email()
    this.refNo = refNo || fakerEN_GB.database.mongodbObjectId()
    this.orgId = orgId
      ? `${orgId}`
      : `${fakerEN_GB.number.int({ min: 500000, max: 999999 })}`
    this.jobTitle = fakerEN_GB.person.jobTitle()
    this.companyName = fakerEN_GB.company.name() + ' Limited'

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

    const postcode = fakerEN_GB.location.zipCode()

    this.address = streetAddress + ',' + fakerEN_GB.location.city()

    this.postcode = postcode

    this.addressServiceNotice =
      fakerEN_GB.location.streetAddress() + ',' + fakerEN_GB.location.city()
  }

  toAllMaterialsPayload(
    material = 'Paper or board (R3)',
    glassRecyclingProcess = 'Both'
  ) {
    const payload = JSON.parse(JSON.stringify(regAllMaterialsPayload))

    payload.data.main.DDVUrr = this.companyName

    payload.data.main.jSlhCJ = this.fullName
    payload.data.main.WOnymw = this.email
    payload.data.main.lScMYi = this.phoneNumber
    payload.data.main.lnBYQc = this.jobTitle

    payload.data.main.eKdnWs = this.fullName
    payload.data.main.CJvZOT = this.email
    payload.data.main.yRKTUh = this.phoneNumber
    payload.data.main.TwIrTO = this.jobTitle

    payload.data.main.LnSGUi = this.fullName
    payload.data.main.pPrfJB = this.email
    payload.data.main.aCYymT = this.phoneNumber
    payload.data.main.DxFVqx = this.jobTitle
    payload.data.main.dFPgaw = material

    if (material === 'Glass (R5)') {
      payload.data.main.YMRnmp = glassRecyclingProcess
    }
    payload.data.main.Laiblc = this.address + ',' + this.postcode
    payload.data.main.xinNGX =
      'TQ ' +
      fakerEN_GB.number.int({ min: 111, max: 500 }) +
      ' ' +
      fakerEN_GB.number.int({ min: 500, max: 999 })

    payload.data.main.VHfukU = this.addressServiceNotice + ',' + this.postcode

    payload.data.main.DAcLmf = this.refNo
    payload.data.main.rJMICz = this.orgId

    payload.data.main.ruHJsg = this.wasteRegNo
    payload.data.main.xMSsbm = 'EPR/AB' + this.permitNo + 'A001'

    payload.data.files.xddzIW[0].fileId = this.fileId1
    payload.data.files.xddzIW[0].userDownloadLink = `https://forms-designer.test.cdp-int.defra.cloud/file-download/${this.fileId1}`
    return payload
  }

  toExporterPayload(
    material = 'Paper or board (R3)',
    glassRecyclingProcess = 'Both'
  ) {
    const payload = JSON.parse(JSON.stringify(regPayload))

    this.material = material

    if (this.material === 'Glass (R5)') {
      payload.data.main.RaiIHT = glassRecyclingProcess
    } else {
      delete payload.data.main.RaiIHT
    }

    payload.data.main.VIxUne = this.companyName

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

    payload.data.main.pGYoub = this.addressServiceNotice
    payload.data.main.fubWwR = this.wasteRegNo
    payload.data.main.CACJrG = this.permitNo
    payload.data.main.QHJFhL = this.permitType

    payload.data.files.qEZeYC[0].fileId = this.fileId1
    payload.data.files.qEZeYC[0].userDownloadLink = `https://forms-designer.test.cdp-int.defra.cloud/file-download/${this.fileId1}`
    payload.data.files.uUWjUW[0].fileId = this.fileId2
    payload.data.files.uUWjUW[0].userDownloadLink = `https://forms-designer.test.cdp-int.defra.cloud/file-download/${this.fileId2}`

    return payload
  }
}

export class SummaryLog {
  constructor(
    orgId = `${fakerEN_GB.number.int({ min: 500000, max: 999999 })}`,
    regId = fakerEN_GB.database.mongodbObjectId()
  ) {
    this.summaryLogId = fakerEN_GB.string.uuid()
    this.orgId = orgId
    this.regId = regId
  }

  setUploadData(uploadData) {
    this.setFileData(
      uploadData.s3Bucket,
      uploadData.s3Key,
      uploadData.fileId,
      uploadData.filename,
      uploadData.fileStatus
    )
  }

  setFileData(s3Bucket, s3Key, fileId, filename, fileStatus) {
    this.s3Bucket = s3Bucket
    this.s3Key = s3Key
    this.fileId = fileId
    this.filename = filename
    this.fileStatus = fileStatus
  }

  toPayload() {
    return {
      s3Bucket: this.s3Bucket,
      s3Key: this.s3Key,
      fileId: this.fileId,
      filename: this.filename
    }
  }

  toUploadCompletedPayload() {
    return {
      form: {
        summaryLogUpload: {
          fileId: this.fileId,
          filename: this.filename,
          fileStatus: this.fileStatus,
          s3Bucket: this.s3Bucket,
          s3Key: this.s3Key
        }
      }
    }
  }
}

export class Organisations {
  toDefaultPayload(dataTableHash) {
    return {
      version: Number(dataTableHash.version),
      updateFragment: organisationsPayload
    }
  }

  toPayload(dataTableHash) {
    let updateFragment
    try {
      updateFragment = JSON.parse(dataTableHash.updateFragment)
    } catch (error) {
      updateFragment = dataTableHash.updateFragment
    }
    return {
      version: Number(dataTableHash.version),
      updateFragment
    }
  }
}
