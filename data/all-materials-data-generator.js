import { BaseAPI } from '../test/apis/base-api.js'
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

async function generate(options = {}) {
  logger.info(
    'Running data generator for all materials per single organisation...'
  )

  const { withUserLinking = false } = options

  const baseAPI = new BaseAPI()
  const defraIdStub = new DefraIdStub()
  const users = new Users()
  const authClient = new AuthClient()

  const materials = [
    { material: 'Aluminium (R4)', suffix: 'AL' },
    { material: 'Fibre-based composite material (R3)', suffix: 'FB' },
    { material: 'Glass (R5)', suffix: 'GL' },
    { material: 'Paper or board (R3)', suffix: 'PA' },
    { material: 'Plastic (R3)', suffix: 'PL' },
    { material: 'Steel (R4)', suffix: 'ST' },
    { material: 'Wood (R3)', suffix: 'WO' }
  ]

  for (let i = 0; i < 10; i++) {
    let wasteProcessingType = 'exp'
    const organisation = new Organisation()

    let organisationPayload = organisation.toPayload()

    if (i % 2 === 0) {
      organisationPayload = organisation.toNonRegisteredUKSoleTraderPayload()
      wasteProcessingType = 'repIn'
    }

    if (i % 3 === 0) {
      organisationPayload = organisation.toNonRegisteredUKSoleTraderPayload()
      wasteProcessingType = 'repOut'
    }

    const orgResponse = await baseAPI.post(
      '/v1/apply/organisation',
      JSON.stringify(organisationPayload)
    )

    const responseData = await orgResponse.body.json()
    const referenceNumber = responseData.referenceNumber
    const orgId = `${responseData.orgId}`

    for (let j = 0; j < materials.length; j++) {
      const material = materials[j].material
      const registration = new Registration(orgId, referenceNumber)
      registration.fullName = organisation.fullName
      registration.email = organisation.email
      registration.phoneNumber = organisation.phoneNumber
      registration.jobTitle = organisation.jobTitle
      registration.address = organisation.address
      registration.refNo = referenceNumber
      registration.orgId = orgId

      let registrationPayload = registration.toExporterPayload(material)

      if (i % 2 === 0 || i % 3 === 0) {
        registrationPayload = registration.toAllMaterialsPayload(material)
      }

      await baseAPI.post(
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

      let accreditationPayload = accreditation.toExporterPayload(material)

      if (i % 2 === 0 || i % 3 === 0) {
        accreditationPayload = accreditation.toReprocessorPayload(material)
      }

      await baseAPI.post(
        '/v1/apply/accreditation',
        JSON.stringify(accreditationPayload)
      )
    }

    await baseAPI.post(
      `/v1/dev/form-submissions/${referenceNumber}/migrate`,
      ''
    )

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
    await authClient.generateToken(payload, urlSuffix)

    const getOrgResponse = await baseAPI.get(
      `/v1/organisations/${referenceNumber}`,
      authClient.authHeader()
    )

    let data = await getOrgResponse.body.json()

    let orgUpdateData = {}

    for (let j = 0; j < materials.length; j++) {
      const suffix = materials[j].suffix

      orgUpdateData =
        i % 2 === 0
          ? {
              status: 'approved',
              regNumber: `R25SR500${j}30912${suffix}`,
              accNumber: `ACC1234${j}56${suffix}`,
              reprocessingType: 'input'
            }
          : {
              status: 'approved',
              regNumber: `25SR5000${j}912${suffix}`,
              accNumber: `ACC1${j}3456${suffix}`
            }

      if (i % 3 === 0) {
        orgUpdateData = {
          status: 'approved',
          regNumber: `R25SR500${j}30912${suffix}`,
          accNumber: `ACC1234${j}56${suffix}`,
          reprocessingType: 'output'
        }
      }
      const currentYear = new Date().getFullYear()

      data.registrations[j].status = orgUpdateData.status
      data.registrations[j].validFrom = '2025-01-01'
      data.registrations[j].validTo = `${currentYear + 1}-01-01`
      if (orgUpdateData.reprocessingType !== '') {
        data.registrations[j].reprocessingType = orgUpdateData.reprocessingType
      }
      data.registrations[j].registrationNumber = orgUpdateData.regNumber
      data.registrations[j].accreditationId = data.accreditations[j].id
      data.accreditations[j].status = orgUpdateData.status
      data.accreditations[j].validFrom = '2025-01-01'
      data.accreditations[j].validTo = `${currentYear + 1}-01-01`
      if (orgUpdateData.reprocessingType !== '') {
        data.accreditations[j].reprocessingType = orgUpdateData.reprocessingType
      }
      data.accreditations[j].accreditationNumber = orgUpdateData.accNumber
    }

    // Replace email address with a newly generated one in Environment to avoid same email address all the time
    let replacementEmail = process.env.ENVIRONMENT
      ? fakerEN_GB.internet.email()
      : data.submitterContactDetails.email
    data.submitterContactDetails.email =
      'AM_' + wasteProcessingType + '_' + replacementEmail

    replacementEmail = 'AM_' + wasteProcessingType + '_' + replacementEmail

    logger.info(
      `${data.registrations[0].wasteProcessingType} Generated email address: ${data.submitterContactDetails.email}`
    )

    data.status = orgUpdateData.status

    data = { organisation: data }

    await baseAPI.patch(
      `/v1/dev/organisations/${referenceNumber}`,
      JSON.stringify(data)
    )

    if (withUserLinking) {
      const user = await users.userPayload(replacementEmail)
      await defraIdStub.register(JSON.stringify(user))

      const params = await users.userParams(user.userId)
      const resp = await defraIdStub.addRelationship(
        params.toString(),
        user.userId
      )
      expect(resp.statusCode).to.equal(302)

      const authPayload = await users.authorisationPayload(replacementEmail)
      const sessionResponse = await defraIdStub.authorise(authPayload)
      const sessionId = sessionResponse.split('sessionId=')[1]

      const tokenPayload = await users.tokenPayload(sessionId)
      await defraIdStub.generateToken(JSON.stringify(tokenPayload), user.userId)

      await baseAPI.post(
        `/v1/organisations/${referenceNumber}/link`,
        '',
        defraIdStub.authHeader(user.userId)
      )
    }
  }

  logger.info(
    'Successfully generated 10 organisation details, registrations and accreditations with All Materials.'
  )
}

const args = process.argv.slice(2)
const options = {}

args.forEach((arg) => {
  if (arg === '--with-linking') {
    options.withUserLinking = true
  }
})

generate(options)
