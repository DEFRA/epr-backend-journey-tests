import ExcelJS from 'exceljs'
import { fakerEN_GB as faker } from '@faker-js/faker'
import logger from '../test/support/logger.js'
import { MATERIALS } from './shared-spreadsheet-values.js'
import {
  generateSentOnRow,
  generateExportedRow
} from './exporter-spreadsheet-data-generator.js'
import {
  generateOutputSentOnRow,
  generateReceivedRow,
  generateOutputReprocessedRow
} from './reprocessor-output.js'

import {
  generateInputSentOnRow,
  generateInputReceivedRow,
  generateInputReprocessedRow
} from './reprocessor-input.js'

function sanitiseFilenameComponent(input) {
  if (typeof input !== 'string') {
    return ''
  }
  return input.replace(/[^a-zA-Z0-9_-]/g, '')
}

// Generate fake registration/accreditation numbers
function generateRegNumber(wasteProcessingType, suffix) {
  const year = new Date().getFullYear().toString().slice(-2)
  const random = Math.floor(Math.random() * 9000) + 1000
  let prefix = 'R'
  if (wasteProcessingType === 'exporter') {
    prefix = 'E'
  }
  return `${prefix}${year}SR500${random}${suffix}`
}

function generateAccNumber(suffix) {
  const random = Math.floor(Math.random() * 900000) + 100000
  return `ACC${random}${suffix}`
}

async function generateSpreadsheetData(options = {}) {
  const {
    wasteProcessingType,
    numberOfRows = 10,
    materialSuffix = null,
    accNumber,
    regNumber
  } = options

  try {
    logger.info('Reading spreadsheet template...')

    // Select material (random or specified)
    let material
    if (materialSuffix) {
      material = MATERIALS.find(
        (m) => m.suffix === materialSuffix.toUpperCase()
      )
      if (!material) {
        logger.error(
          `Material with suffix '${materialSuffix}' not found. Available: ${MATERIALS.map((m) => m.suffix).join(', ')}`
        )
        process.exit(1)
      }
    } else {
      material = faker.helpers.arrayElement(MATERIALS)
    }

    const registrationNumber =
      regNumber || generateRegNumber(wasteProcessingType, material.suffix)
    const accreditationNumber = accNumber || generateAccNumber(material.suffix)

    let templateFile
    let worksheets

    if (wasteProcessingType === 'exporter') {
      templateFile = './data/exporter.template.xlsx'
      worksheets = [
        { name: 'Exported (sections 1, 2 and 3)', fn: generateExportedRow },
        { name: 'Sent on (sections 4 and 5)', fn: generateSentOnRow }
      ]
    } else if (wasteProcessingType === 'reprocessorOutput') {
      templateFile = './data/reprocessor.output.template.xlsx'
      worksheets = [
        { name: 'Received (sections 1 and 2)', fn: generateReceivedRow },
        {
          name: 'Reprocessed (sections 3 and 4)',
          fn: generateOutputReprocessedRow
        },
        { name: 'Sent on (sections 5 and 6)', fn: generateOutputSentOnRow }
      ]
    } else {
      templateFile = './data/reprocessor.input.template.xlsx'
      worksheets = [
        {
          name: 'Received (sections 1, 2 and 3)',
          fn: generateInputReceivedRow
        },
        {
          name: 'Reprocessed (section 4)',
          fn: generateInputReprocessedRow
        },
        { name: 'Sent on (sections 5, 6 and 7)', fn: generateInputSentOnRow }
      ]
    }

    // Create workbook and read the template
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(templateFile)

    // Update the Cover sheet
    const coverSheet = workbook.getWorksheet('Cover')
    if (coverSheet) {
      coverSheet.getCell('E7').value = material.dropdownValue
      coverSheet.getCell('E10').value = registrationNumber
      coverSheet.getCell('E13').value = accreditationNumber

      logger.info(
        `Updated Cover sheet -- Material: ${material.material}, Registration: ${registrationNumber}, Accreditation: ${accreditationNumber}`
      )
    } else {
      logger.warn('Cover sheet not found')
    }

    for (const worksheet of worksheets) {
      const sheet = workbook.getWorksheet(worksheet.name)
      if (sheet) {
        logger.info(`Generating data for ${worksheet.name}...`)

        let currentRow = 4 // Start from row 4

        for (let i = 0; i < numberOfRows; i++) {
          const rowData = worksheet.fn(material)

          // Fix an issue where first row formula is not populated
          if (i === 0) {
            if (worksheet.name === 'Exported (sections 1, 2 and 3)') {
              rowData.N = rowData.K - (rowData.L + rowData.M)
            } else if (wasteProcessingType === 'reprocessorOutput') {
              if (worksheet.name === 'Received (sections 1 and 2)') {
                rowData.N = rowData.K - (rowData.L + rowData.M)
              } else if (worksheet.name === 'Reprocessed (sections 3 and 4)') {
                rowData.J = rowData.H * rowData.I
              }
            } else if (
              wasteProcessingType === 'reprocessorInput' &&
              worksheet.name === 'Received (sections 1, 2 and 3)'
            ) {
              rowData.N = rowData.K - (rowData.L + rowData.M)
            }
          }

          // Insert data only into specified columns
          Object.entries(rowData).forEach(([columnLetter, value]) => {
            const cell = sheet.getCell(`${columnLetter}${currentRow}`)
            cell.value = value
          })

          currentRow++
        }

        logger.info(
          `Generated ${numberOfRows} rows for ${worksheet.name} (rows 4-${currentRow - 1})`
        )
      }
    }

    const safeType = sanitiseFilenameComponent(wasteProcessingType)
    const safeAcc = sanitiseFilenameComponent(accreditationNumber)
    const safeReg = sanitiseFilenameComponent(registrationNumber)
    const outputFile = `./data/${safeType}_${safeAcc}_${safeReg}.xlsx`
    await workbook.xlsx.writeFile(outputFile)

    logger.info(`Successfully generated spreadsheet: ${outputFile}`)
  } catch (error) {
    logger.error('Error generating spreadsheet:', error.message)
    logger.error(error.stack)
    process.exit(1)
  }
}

// Parse command line arguments
const args = process.argv.slice(2)
const options = {}

if (process.env.MATERIAL) {
  options.materialSuffix = process.env.MATERIAL
}

if (process.env.ROWS) {
  options.numberOfRows = parseInt(process.env.ROWS, 10)
}

if (process.env.ACC_NUMBER) {
  options.accNumber = process.env.ACC_NUMBER
}

if (process.env.REG_NUMBER) {
  options.regNumber = process.env.REG_NUMBER
}

args.forEach((arg) => {
  if (arg.startsWith('--material=')) {
    options.materialSuffix = arg.split('=')[1]
  } else if (arg.startsWith('--rows=')) {
    options.numberOfRows = parseInt(arg.split('=')[1], 10)
  } else if (arg.startsWith('--wasteProcessingType=')) {
    options.wasteProcessingType = arg.split('=')[1]
  } else if (arg.startsWith('--accNumber=')) {
    options.accNumber = arg.split('=')[1]
  } else if (arg.startsWith('--regNumber=')) {
    options.regNumber = arg.split('=')[1]
  }
})

generateSpreadsheetData(options)
