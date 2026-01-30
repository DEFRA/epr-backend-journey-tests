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
  logger.info('Running data generator...')

  const { withUserLinking = false } = options
  const context = new GeneratorContext()

  const materialIndex = Math.floor(Math.random() * MATERIALS.length)
  const material = MATERIALS[materialIndex].material
  const suffix = MATERIALS[materialIndex].suffix
  const glassRecyclingProcess = MATERIALS[materialIndex].glassRecyclingProcess

  for (let i = 0; i < 10; i++) {
    const { organisation, referenceNumber, orgId } = await createOrganisation(
      context,
      i % 2 === 0
    )
    let wasteProcessingType = 'exp'
    let reprocessingType = null

    if (i % 2 === 0) {
      wasteProcessingType = 'repIn'
      reprocessingType = 'input'
    }

    if (i % 3 === 0) {
      wasteProcessingType = 'repOut'
      reprocessingType = 'output'
    }

    await createRegistrationAndAccreditation(context, {
      organisation,
      orgId,
      referenceNumber,
      material,
      isExporter: i % 2 !== 0,
      glassRecyclingProcess
    })

    await migrateFormSubmission(context, referenceNumber)
    await generateAuthToken(context)

    const updateData = generateOrgUpdateData(i, suffix, reprocessingType)

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
    `Successfully generated 10 organisation details, registrations and accreditations for material: ${logDesc}`
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
