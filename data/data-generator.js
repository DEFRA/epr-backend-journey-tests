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
  logger.info('Running data generator...')

  const { withUserLinking = false } = options
  const context = new GeneratorContext()

  const materialIndex = Math.floor(Math.random() * MATERIALS.length)
  const material = MATERIALS[materialIndex].material
  const suffix = MATERIALS[materialIndex].suffix
  const glassRecyclingProcess = MATERIALS[materialIndex].glassRecyclingProcess

  for (let i = 0; i < 5; i++) {
    const { organisation, referenceNumber, orgId } = await createOrganisation(
      context,
      i % 2 === 0
    )
    let wasteProcessingType = 'exporter'

    if (i % 2 === 0) {
      wasteProcessingType = 'input'
    }

    if (i % 3 === 0) {
      wasteProcessingType = 'output'
    }

    if (i % 4 === 0) {
      wasteProcessingType = 'regOnlyReproc'
    }

    if (i % 5 === 0) {
      wasteProcessingType = 'regOnlyExporter'
    }

    if (!wasteProcessingType.startsWith('regOnly')) {
      await createRegistrationAndAccreditation(context, {
        organisation,
        orgId,
        referenceNumber,
        material,
        isExporter: wasteProcessingType === 'exporter',
        glassRecyclingProcess
      })
    } else {
      await createRegistration(context, {
        organisation,
        orgId,
        referenceNumber,
        material,
        isExporter: wasteProcessingType === 'regOnlyExporter',
        glassRecyclingProcess
      })
    }

    await migrateFormSubmission(context, referenceNumber)
    await generateAuthToken(context)

    const updateData = generateOrgUpdateData(i, suffix, wasteProcessingType)

    const email = await updateOrganisationData(context, {
      referenceNumber,
      registrationUpdates: [{ index: 0, updateData }],
      emailPrefix: suffix + '_' + wasteProcessingType
    })

    if (withUserLinking) {
      await linkUser(context, { referenceNumber, email })
    }
  }

  let logDesc = material
  if (material === 'Glass (R5)') {
    logDesc = material + ' (' + glassRecyclingProcess + ')'
  }
  logger.info(
    `Successfully generated 5 organisation details, registrations and accreditations for material: ${logDesc}`
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
