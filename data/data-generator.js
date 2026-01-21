import { BaseAPI } from '../test/apis/base-api.js'
import {
  Accreditation,
  Organisation,
  Registration
} from '../test/support/generator.js'

import logger from '../test/support/logger.js'
import config from '../test/config/config.js'
import { setGlobalDispatcher } from 'undici'

setGlobalDispatcher(config.undiciAgent)

async function generate() {
  logger.info('Running data generator...')
  const baseAPI = new BaseAPI()

  for (let i = 0; i < 50; i++) {
    const organisation = new Organisation()

    let organisationPayload = organisation.toPayload()

    if (i % 5 === 0) {
      organisationPayload =
        organisation.toNonRegisteredOutsideUKAddressPayload()
    } else if (i % 3 === 0) {
      organisationPayload = organisation.toWithPartnershipPayload()
    } else if (i % 2 === 0) {
      organisationPayload = organisation.toNonRegisteredUKSoleTraderPayload()
    }

    const orgResponse = await baseAPI.post(
      '/v1/apply/organisation',
      JSON.stringify(organisationPayload)
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

    let registrationPayload = registration.toExporterPayload()

    if (i % 2 === 0) {
      registrationPayload = registration.toAllMaterialsPayload()
    }

    baseAPI.post('/v1/apply/registration', JSON.stringify(registrationPayload))

    const accreditation = new Accreditation()

    accreditation.fullName = organisation.fullName
    accreditation.email = organisation.email
    accreditation.phoneNumber = organisation.phoneNumber
    accreditation.jobTitle = organisation.jobTitle
    accreditation.refNo = referenceNumber
    accreditation.orgId = orgId
    accreditation.material = registration.material

    let accreditationPayload = accreditation.toExporterPayload()

    if (i % 2 === 0) {
      accreditationPayload = accreditation.toReprocessorPayload()
    }

    baseAPI.post(
      '/v1/apply/accreditation',
      JSON.stringify(accreditationPayload)
    )

    // Delay by 25ms to avoid collision of orgId in org payload
    await new Promise((resolve) => setTimeout(resolve, 25))
  }

  logger.info(
    'Successfully generated 50 organisation details, registrations and accreditations.'
  )
}

generate()
