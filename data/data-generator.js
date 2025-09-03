import accPayload from '../test/fixtures/accreditation.json' with { type: 'json' }
import orgPayload from '../test/fixtures/organisation.json' with { type: 'json' }
import regPayload from '../test/fixtures/registration.json' with { type: 'json' }
import { fakerEN_GB } from '@faker-js/faker'
import { BaseAPI } from '../test/apis/base-api.js'

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

async function generate() {
  // eslint-disable-next-line no-console
  console.log('Running data generator...')
  const baseAPI = new BaseAPI()

  for (let i = 0; i < 50; i++) {
    const organisation = JSON.parse(JSON.stringify(orgPayload))

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

    organisation.data.main.BYtjnh = fullName
    organisation.data.main.aSoxDO = email
    organisation.data.main.aIFHXo = phoneNumber
    organisation.data.main.LyeSzH = jobTitle
    organisation.data.main.WVADkQ = role
    organisation.data.main.JbEBvr = companyName
    organisation.data.main.QdhMJS = companyName
    organisation.data.main.VcdRNr = nations.slice(0, numberOfNations).join(', ')
    organisation.data.main.VATjEi = address

    const orgResponse = await baseAPI.post(
      '/v1/apply/organisation',
      JSON.stringify(organisation)
    )

    const responseData = await orgResponse.body.json()
    const referenceNumber = responseData.referenceNumber
    const orgId = `${responseData.orgId}`

    const registration = JSON.parse(JSON.stringify(regPayload))
    registration.data.main.CzNRVZ = fullName
    registration.data.main.xpDUqn = email
    registration.data.main.ZgTfLO = phoneNumber
    registration.data.main.aSKIDS = jobTitle

    registration.data.main.NOwTKr = fullName
    registration.data.main.rYgNmR = email
    registration.data.main.inueIm = phoneNumber
    registration.data.main.MdZwoU = jobTitle

    registration.data.main.RPiGkV = fullName
    registration.data.main.eSxaKY = email
    registration.data.main.AkoyKd = phoneNumber
    registration.data.main.mGpVDA = jobTitle

    registration.data.main.RIXIzA = referenceNumber
    registration.data.main.QnSRcX = orgId

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

    const fileId1 = fakerEN_GB.string.uuid()
    const fileId2 = fakerEN_GB.string.uuid()

    registration.data.main.BeHQjA = material

    registration.data.main.pGYoub = address
    registration.data.main.fubWwR = wasteRegNo
    registration.data.main.CACJrG = permitNo
    registration.data.main.vsaLhJ = supplier
    registration.data.main.QHJFhL = permitType

    registration.data.repeaters.GzScMv[0].ZcjmuP = port

    registration.data.files.qEZeYC[0].fileId = fileId1
    registration.data.files.qEZeYC[0].userDownloadLink = `https://forms-designer.test.cdp-int.defra.cloud/file-download/${fileId1}`
    registration.data.files.uUWjUW[0].fileId = fileId2
    registration.data.files.uUWjUW[0].userDownloadLink = `https://forms-designer.test.cdp-int.defra.cloud/file-download/${fileId2}`

    baseAPI.post('/v1/apply/registration', JSON.stringify(registration))

    const accreditation = JSON.parse(JSON.stringify(accPayload))

    const tonnageBandIndex = Math.floor(Math.random() * tonnageBands.length)
    const tonnageBand = tonnageBands[tonnageBandIndex]
    const reproPercentage = `${fakerEN_GB.number.int({ min: 10, max: 100 })}`
    const priceSupportPercentage = `${fakerEN_GB.number.int({ min: 10, max: 100 })}`
    const businessSupportPercentage = `${fakerEN_GB.number.int({ min: 10, max: 100 })}`
    const commsPercentage = `${fakerEN_GB.number.int({ min: 10, max: 100 })}`
    const developingNewMarketsPercentage = `${fakerEN_GB.number.int({ min: 1, max: 40 })}`
    const developingNewUsesPercentage = `${fakerEN_GB.number.int({ min: 1, max: 30 })}`
    const otherCategoriesPercentage = `${fakerEN_GB.number.int({ min: 1, max: 20 })}`

    accreditation.data.main.WGGxRc = fullName
    accreditation.data.main.qeJOQY = email
    accreditation.data.main.xyQDVo = phoneNumber
    accreditation.data.main.NQtVfy = jobTitle
    accreditation.data.main.MyWHms = referenceNumber
    accreditation.data.main.Ooierc = orgId
    accreditation.data.main.qkCaCh = material
    accreditation.data.main.XKWebf = tonnageBand

    accreditation.data.main.yzvIcu = reproPercentage
    accreditation.data.main.vjegvC = priceSupportPercentage
    accreditation.data.main.gGuncQ = businessSupportPercentage
    accreditation.data.main.jqvpTT = commsPercentage
    accreditation.data.main.lACgrU = developingNewMarketsPercentage
    accreditation.data.main.gBpCMU = developingNewUsesPercentage
    accreditation.data.main.czCOzR = otherCategoriesPercentage

    accreditation.data.repeaters.QkZUNV[0].jiMeVj = fullName
    accreditation.data.repeaters.QkZUNV[0].eWxRYL = email
    accreditation.data.repeaters.QkZUNV[0].NRkpFI = phoneNumber
    accreditation.data.repeaters.QkZUNV[0].LUGryB = jobTitle
    accreditation.data.files.TJTMtQ[0].fileId = fileId1
    accreditation.data.files.TJTMtQ[0].userDownloadLink = `https://forms-designer.test.cdp-int.defra.cloud/file-download/${fileId1}`
    accreditation.data.files.zYxOlv[0].fileId = fileId2
    accreditation.data.files.zYxOlv[0].userDownloadLink = `https://forms-designer.test.cdp-int.defra.cloud/file-download/${fileId2}`

    baseAPI.post('/v1/apply/accreditation', JSON.stringify(accreditation))

    // Delay by 25ms to avoid collision of orgId in org payload
    await new Promise((resolve) => setTimeout(resolve, 25))
  }

  // eslint-disable-next-line no-console
  console.log(
    'Successfully generated 50 organisation details, registrations and accreditations.'
  )
}

generate()
