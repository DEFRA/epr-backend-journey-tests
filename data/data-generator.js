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
  logger.info('Running data generator...')

  const { withUserLinking = false } = options

  const baseAPI = new BaseAPI()
  const defraIdStub = new DefraIdStub()
  const users = new Users()
  const authClient = new AuthClient()

  const materials = [
    'Aluminium (R4)',
    'Fibre-based composite material (R3)',
    'Glass (R5)',
    'Paper or board (R3)',
    'Plastic (R3)',
    'Steel (R4)',
    'Wood (R3)'
  ]

  const materialIndex = Math.floor(Math.random() * materials.length)

  for (let i = 0; i < 50; i++) {
    const organisation = new Organisation()

    let organisationPayload = organisation.toPayload()

    if (i % 2 === 0) {
      organisationPayload = organisation.toNonRegisteredUKSoleTraderPayload()
    }

    const orgResponse = await baseAPI.post(
      '/v1/apply/organisation',
      JSON.stringify(organisationPayload)
    )

    const responseData = await orgResponse.body.json()
    const referenceNumber = responseData.referenceNumber
    const orgId = `${responseData.orgId}`

    const material = materials[materialIndex]
    const registration = new Registration(orgId, referenceNumber)
    registration.fullName = organisation.fullName
    registration.email = organisation.email
    registration.phoneNumber = organisation.phoneNumber
    registration.jobTitle = organisation.jobTitle
    registration.address = organisation.address
    registration.refNo = referenceNumber
    registration.orgId = orgId

    let registrationPayload = registration.toExporterPayload(material)

    if (i % 2 === 0) {
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
    accreditation.postcode = organisation.postcode

    let accreditationPayload = accreditation.toExporterPayload(material)

    if (i % 2 === 0) {
      accreditationPayload = accreditation.toReprocessorPayload(material)
    }

    await baseAPI.post(
      '/v1/apply/accreditation',
      JSON.stringify(accreditationPayload)
    )

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

    let updateDataRows = [
      {
        status: 'approved',
        regNumber: `E25SR5000${i}912PA`,
        accNumber: `ACC1${i}3456`
      }
    ]

    if (i % 2 === 0) {
      updateDataRows = [
        {
          status: 'approved',
          regNumber: `R25SR500${i}30912PA`,
          accNumber: `ACC1234${i}56`,
          reprocessingType: 'input'
        }
      ]
    }

    const currentYear = new Date().getFullYear()

    const registrationIds = new Map()
    const accreditationIds = new Map()

    for (let i = 0; i < updateDataRows.length; i++) {
      const orgUpdateData = updateDataRows[i]
      data.registrations[i].status = orgUpdateData.status
      data.registrations[i].validFrom = '2025-01-01'
      data.registrations[i].validTo = `${currentYear + 1}-01-01`
      if (orgUpdateData.reprocessingType !== '') {
        data.registrations[i].reprocessingType = orgUpdateData.reprocessingType
      }
      data.registrations[i].registrationNumber = orgUpdateData.regNumber
      data.registrations[i].accreditationId = data.accreditations[i].id
      data.accreditations[i].status = orgUpdateData.status
      data.accreditations[i].validFrom = '2025-01-01'
      data.accreditations[i].validTo = `${currentYear + 1}-01-01`
      if (orgUpdateData.reprocessingType !== '') {
        data.accreditations[i].reprocessingType = orgUpdateData.reprocessingType
      }
      data.accreditations[i].accreditationNumber = orgUpdateData.accNumber

      registrationIds.set(orgUpdateData.regNumber, data.registrations[i].id)
      accreditationIds.set(orgUpdateData.accNumber, data.accreditations[i].id)
    }

    // Replace email address with a newly generated one in Environment to avoid same email address all the time
    const replacementEmail = process.env.ENVIRONMENT
      ? fakerEN_GB.internet.email()
      : data.submitterContactDetails.email
    data.submitterContactDetails.email = replacementEmail

    data.status = updateDataRows[0].status

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
    'Successfully generated 50 organisation details, registrations and accreditations.'
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
