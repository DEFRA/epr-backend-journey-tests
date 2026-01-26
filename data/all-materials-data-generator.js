import logger from '../test/support/logger.js'
import {
  MATERIALS,
  GeneratorContext,
  createOrganisation,
  createRegistrationAndAccreditation,
  generateAuthToken,
  generateOrgUpdateData,
  updateOrganisationData,
  linkUser,
  migrateFormSubmission
} from './shared-generator-utils.js'

async function generate(options = {}) {
  logger.info(
    'Running data generator for all materials per single organisation...'
  )

  const { withUserLinking = false } = options
  const context = new GeneratorContext()

  for (let i = 0; i < 10; i++) {
    let wasteProcessingType = 'exp'
    let isNonRegistered = false
    let reprocessingType = null

    if (i % 2 === 0) {
      isNonRegistered = true
      wasteProcessingType = 'repIn'
      reprocessingType = 'input'
    }

    if (i % 3 === 0) {
      isNonRegistered = true
      wasteProcessingType = 'repOut'
      reprocessingType = 'output'
    }

    const { organisation, referenceNumber, orgId } = await createOrganisation(
      context,
      isNonRegistered
    )

    for (let j = 0; j < MATERIALS.length; j++) {
      await createRegistrationAndAccreditation(context, {
        organisation,
        orgId,
        referenceNumber,
        material: MATERIALS[j].material,
        isExporter: i % 2 !== 0 && i % 3 !== 0,
        glassRecyclingProcess: MATERIALS[j].glassRecyclingProcess
      })
    }

    await migrateFormSubmission(context, referenceNumber)
    await generateAuthToken(context)

    const registrationUpdates = MATERIALS.map((mat, j) => ({
      index: j,
      updateData: generateOrgUpdateData(j, mat.suffix, reprocessingType)
    }))

    const email = await updateOrganisationData(context, {
      referenceNumber,
      registrationUpdates,
      emailPrefix: `AM_${wasteProcessingType}`
    })

    if (withUserLinking) {
      await linkUser(context, { referenceNumber, email })
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
