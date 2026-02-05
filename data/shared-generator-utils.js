import { EprBackendApi } from '../test/apis/epr.backend.api.js'
import {
  Accreditation,
  Organisation,
  Registration
} from '../test/support/generator.js'
import logger from '../test/support/logger.js'
import config from '../test/config/config.js'
import { FormData, setGlobalDispatcher } from 'undici'
import { expect } from 'chai'
import { DefraIdStub } from '../test/support/defra-id-stub.js'
import Users from '../test/support/users.js'
import { fakerEN_GB } from '@faker-js/faker'
import { AuthClient } from '../test/support/auth.js'

setGlobalDispatcher(config.undiciAgent)

export const MATERIALS = [
  { material: 'Aluminium (R4)', suffix: 'AL' },
  { material: 'Fibre-based composite material (R3)', suffix: 'FB' },
  {
    material: 'Glass (R5)',
    suffix: 'GR',
    glassRecyclingProcess: 'Glass re-melt'
  },
  {
    material: 'Glass (R5)',
    suffix: 'GO',
    glassRecyclingProcess: 'Glass other'
  },
  { material: 'Paper or board (R3)', suffix: 'PA' },
  { material: 'Plastic (R3)', suffix: 'PL' },
  { material: 'Steel (R4)', suffix: 'ST' },
  { material: 'Wood (R3)', suffix: 'WO' }
]

export class GeneratorContext {
  constructor() {
    this.baseAPI = new EprBackendApi()
    this.defraIdStub = new DefraIdStub()
    this.users = new Users()
    this.authClient = new AuthClient()
  }
}

export async function createOrganisation(context, isNonRegistered) {
  const organisation = new Organisation()
  const organisationPayload = isNonRegistered
    ? organisation.toNonRegisteredUKSoleTraderPayload()
    : organisation.toPayload()

  const orgResponse = await context.baseAPI.post(
    '/v1/apply/organisation',
    JSON.stringify(organisationPayload)
  )

  const responseData = await orgResponse.body.json()
  return {
    organisation,
    referenceNumber: responseData.referenceNumber,
    orgId: `${responseData.orgId}`
  }
}

export async function createRegistrationAndAccreditation(
  context,
  {
    organisation,
    orgId,
    referenceNumber,
    material,
    street,
    isExporter,
    glassRecyclingProcess
  }
) {
  const registration = street
    ? new Registration(orgId, referenceNumber, street)
    : new Registration(orgId, referenceNumber)

  registration.fullName = organisation.fullName
  registration.email = organisation.email
  registration.phoneNumber = organisation.phoneNumber
  registration.jobTitle = organisation.jobTitle
  registration.refNo = referenceNumber
  registration.orgId = orgId

  const registrationPayload = isExporter
    ? registration.toExporterPayload(material, glassRecyclingProcess)
    : registration.toAllMaterialsPayload(material, glassRecyclingProcess)

  await context.baseAPI.post(
    '/v1/apply/registration',
    JSON.stringify(registrationPayload)
  )

  const accreditation = new Accreditation(orgId, referenceNumber)
  accreditation.fullName = organisation.fullName
  accreditation.email = organisation.email
  accreditation.phoneNumber = organisation.phoneNumber
  accreditation.jobTitle = organisation.jobTitle
  accreditation.refNo = referenceNumber
  accreditation.orgId = orgId
  accreditation.material = registration.material
  accreditation.postcode = registration.postcode

  const accreditationPayload = isExporter
    ? accreditation.toExporterPayload(material, glassRecyclingProcess)
    : accreditation.toReprocessorPayload(material, glassRecyclingProcess)

  await context.baseAPI.post(
    '/v1/apply/accreditation',
    JSON.stringify(accreditationPayload)
  )
}

export async function generateAuthToken(context) {
  let payload, urlSuffix
  if (process.env.ENVIRONMENT === 'test') {
    payload = new FormData()
    payload.append('client_id', config.auth.clientId)
    payload.append('client_secret', config.auth.clientSecret)
    payload.append('username', config.auth.username)
    payload.append('password', config.auth.password)
    payload.append('scope', config.auth.scope)
    payload.append('grant_type', config.auth.grantType)
    urlSuffix = ''
  } else {
    const clientId = 'clientId'
    const username = 'ea@test.gov.uk'
    payload = JSON.stringify({ clientId, username })
    urlSuffix = '/sign'
  }
  await context.authClient.generateToken(payload, urlSuffix)
}

export function generateOrgUpdateData(index, suffix, reprocessingType = null) {
  const baseData = {
    status: 'approved'
  }

  if (reprocessingType === 'input') {
    return {
      ...baseData,
      regNumber: `R25SR500${index}30912${suffix}`,
      accNumber: `ACC1234${index}56${suffix}`,
      reprocessingType: 'input'
    }
  } else if (reprocessingType === 'output') {
    return {
      ...baseData,
      regNumber: `R25SR500${index}30912${suffix}`,
      accNumber: `ACC1234${index}56${suffix}`,
      reprocessingType: 'output'
    }
  } else {
    return {
      ...baseData,
      regNumber: `E25SR5000${index}912${suffix}`,
      accNumber: `ACC1${index}3456${suffix}`
    }
  }
}

export async function updateOrganisationData(
  context,
  {
    referenceNumber,
    registrationUpdates,
    emailPrefix,
    validFrom = '2026-01-01'
  }
) {
  const getOrgResponse = await context.baseAPI.get(
    `/v1/organisations/${referenceNumber}`,
    context.authClient.authHeader()
  )

  let data = await getOrgResponse.body.json()
  const currentYear = new Date().getFullYear()

  // Apply updates to registrations and accreditations
  registrationUpdates.forEach(({ index, updateData }) => {
    data.registrations[index].status = updateData.status
    data.registrations[index].validFrom = validFrom
    data.registrations[index].validTo = `${currentYear + 1}-01-01`
    if (updateData.reprocessingType) {
      data.registrations[index].reprocessingType = updateData.reprocessingType
    }
    data.registrations[index].registrationNumber = updateData.regNumber
    data.registrations[index].accreditationId = data.accreditations[index].id

    data.accreditations[index].status = updateData.status
    data.accreditations[index].validFrom = validFrom
    data.accreditations[index].validTo = `${currentYear + 1}-01-01`
    if (updateData.reprocessingType) {
      data.accreditations[index].reprocessingType = updateData.reprocessingType
    }
    data.accreditations[index].accreditationNumber = updateData.accNumber
  })

  // Update email
  let replacementEmail = process.env.ENVIRONMENT
    ? fakerEN_GB.internet.email()
    : data.submitterContactDetails.email
  data.submitterContactDetails.email = `${emailPrefix}_${replacementEmail}`
  replacementEmail = `${emailPrefix}_${replacementEmail}`

  logger.info(`Generated email address: ${data.submitterContactDetails.email}`)

  data.status =
    registrationUpdates[registrationUpdates.length - 1].updateData.status
  data = { organisation: data }

  await context.baseAPI.patch(
    `/v1/dev/organisations/${referenceNumber}`,
    JSON.stringify(data)
  )

  return replacementEmail
}

export async function linkUser(context, { referenceNumber, email }) {
  const user = await context.users.userPayload(email)
  await context.defraIdStub.register(JSON.stringify(user))

  const params = await context.users.userParams(user.userId)
  const resp = await context.defraIdStub.addRelationship(
    params.toString(),
    user.userId
  )
  expect(resp.statusCode).to.equal(302)

  const authPayload = await context.users.authorisationPayload(email)
  const sessionResponse = await context.defraIdStub.authorise(authPayload)
  const sessionId = sessionResponse.split('sessionId=')[1]

  const tokenPayload = await context.users.tokenPayload(sessionId)
  await context.defraIdStub.generateToken(
    JSON.stringify(tokenPayload),
    user.userId
  )

  await context.baseAPI.post(
    `/v1/organisations/${referenceNumber}/link`,
    '',
    context.defraIdStub.authHeader(user.userId)
  )
}

export async function migrateFormSubmission(context, referenceNumber) {
  await context.baseAPI.post(
    `/v1/dev/form-submissions/${referenceNumber}/migrate`,
    ''
  )
}
