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
  migrateFormSubmission,
  createRegistration
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
    let streets = []
    if (i % 2 === 0) {
      streets = [
        'reprocessor input street',
        'reprocessor output street',
        'exporter street',
        'registered only reprocessor'
      ]
    } else {
      streets = [
        'reprocessor input street',
        'reprocessor output street',
        'registered only exporter'
      ]
    }

    const noOfWasteProcessingTypes = streets.length

    for (let m = 0; m < noOfWasteProcessingTypes; m++) {
      const wasteProcessingType = streets[m]
      for (let j = 0; j < MATERIALS.length; j++) {
        if (!wasteProcessingType.includes('registered only')) {
          await createRegistrationAndAccreditation(context, {
            organisation,
            orgId,
            referenceNumber,
            material: MATERIALS[j].material,
            street: streets[m],
            isExporter: wasteProcessingType.includes('exporter'),
            glassRecyclingProcess: MATERIALS[j].glassRecyclingProcess
          })
        } else {
          await createRegistration(context, {
            organisation,
            orgId,
            referenceNumber,
            material: MATERIALS[j].material,
            street: streets[m],
            isExporter: wasteProcessingType.includes('exporter'),
            glassRecyclingProcess: MATERIALS[j].glassRecyclingProcess
          })
        }
      }
    }

    await migrateFormSubmission(context, referenceNumber)
    await generateAuthToken(context)

    const registrationUpdates = []
    for (let j = 0; j < MATERIALS.length * noOfWasteProcessingTypes; j++) {
      const wasteProcessingType = streets[Math.floor(j / MATERIALS.length)]

      const suffix = MATERIALS[j % MATERIALS.length].suffix
      let registrationType = 'input'

      if (wasteProcessingType.includes('output')) {
        registrationType = 'output'
      } else if (wasteProcessingType.includes('exporter street')) {
        registrationType = 'exporter'
      } else if (wasteProcessingType.includes('registered only reprocessor')) {
        registrationType = 'regOnlyReproc'
      } else if (wasteProcessingType.includes('registered only exporter')) {
        registrationType = 'regOnlyExporter'
      }

      registrationUpdates.push({
        index: j,
        updateData: generateOrgUpdateData(
          Math.floor(j / MATERIALS.length),
          suffix,
          registrationType
        )
      })
    }

    const emailPrefix = i % 2 === 0 ? 'AM_AllTypes' : 'AM_ExporterRegOnly'

    const email = await updateOrganisationData(context, {
      referenceNumber,
      registrationUpdates,
      emailPrefix,
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
