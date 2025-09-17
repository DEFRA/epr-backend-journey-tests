import { BaseAPI } from '../test/apis/base-api.js'
import {
  Accreditation,
  Organisation,
  Registration
} from '../test/support/generator.js'

import logger from '../test/support/logger.js'

async function generate() {
  logger.info('Running data generator...')
  const baseAPI = new BaseAPI()

  for (let i = 0; i < 50; i++) {
    const organisation = new Organisation()

    const orgResponse = await baseAPI.post(
      '/v1/apply/organisation',
      JSON.stringify(organisation.toPayload())
    )

    const responseData = await orgResponse.body.json()
    const referenceNumber = responseData.referenceNumber
    const orgId = `${responseData.orgId}`
    const registration = new Registration()

    registration.fullName = organisation.fullName
    registration.email = organisation.email
    registration.phoneNumber = organisation.phoneNumber
    registration.jobTitle = organisation.jobTitle
    registration.address = organisation.address
    registration.refNo = referenceNumber
    registration.orgId = orgId

    baseAPI.post(
      '/v1/apply/registration',
      JSON.stringify(registration.toPayload())
    )

    const accreditation = new Accreditation()

    accreditation.fullName = organisation.fullName
    accreditation.email = organisation.email
    accreditation.phoneNumber = organisation.phoneNumber
    accreditation.jobTitle = organisation.jobTitle
    accreditation.refNo = referenceNumber
    accreditation.orgId = orgId
    accreditation.material = registration.material

    baseAPI.post(
      '/v1/apply/accreditation',
      JSON.stringify(accreditation.toPayload())
    )

    // Delay by 25ms to avoid collision of orgId in org payload
    await new Promise((resolve) => setTimeout(resolve, 25))
  }

  logger.info(
    'Successfully generated 50 organisation details, registrations and accreditations.'
  )
}

generate()
