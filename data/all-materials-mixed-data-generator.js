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

  for (let i = 0; i < 5; i++) {
    const { organisation, referenceNumber, orgId } = await createOrganisation(
      context,
      i % 2 === 0
    )

    for (let m = 0; m < 3; m++) {
      const streets = [
        'reprocessor input street',
        'reprocessor output street',
        'exporter street'
      ]

      for (let j = 0; j < MATERIALS.length; j++) {
        await createRegistrationAndAccreditation(context, {
          organisation,
          orgId,
          referenceNumber,
          material: MATERIALS[j].material,
          street: streets[m],
          isExporter: m === 2,
          glassRecyclingProcess: MATERIALS[j].glassRecyclingProcess
        })
      }
    }

    await migrateFormSubmission(context, referenceNumber)
    await generateAuthToken(context)

    const registrationUpdates = []
    for (let j = 0; j < MATERIALS.length * 3; j++) {
      const suffix = MATERIALS[j % MATERIALS.length].suffix
      let reprocessingType = 'input'

      if (j >= MATERIALS.length && j < MATERIALS.length * 2) {
        reprocessingType = 'output'
      } else if (j >= MATERIALS.length * 2) {
        reprocessingType = null
      }

      registrationUpdates.push({
        index: j,
        updateData: generateOrgUpdateData(
          Math.floor(j / MATERIALS.length),
          suffix,
          reprocessingType
        )
      })
    }

    const email = await updateOrganisationData(context, {
      referenceNumber,
      registrationUpdates,
      emailPrefix: 'AM_AllTypes',
      validFrom: '2026-01-01'
    })

    if (withUserLinking) {
      await linkUser(context, { referenceNumber, email })
    }
  }

  logger.info(
    'Successfully generated 5 organisation details, registrations and accreditations with All Materials and All Reprocessor / Exporter types.'
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
