import ExcelJS from 'exceljs'
import { fakerEN_GB as faker } from '@faker-js/faker'
import logger from '../test/support/logger.js'
import { MATERIALS } from './shared-spreadsheet-values.js'
import { generateSentOnRow, generateExportedRow } from './exporter.js'
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
import {
  generateRegOnlyExportedRow,
  generateRegOnlyReceivedRow,
  generateRegOnlySentOnRow
} from './exporter.reg.only.js'
import {
  generateRegOnlyReprocessorReceivedRow,
  generateRegOnlyReprocessorSentOnRow
} from './reprocessor.reg.only.js'

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
    regNumber,
    sheets = null,
    filename = null,
    rowOffset = 0
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

    const PROCESSING_TYPE_CONFIG = {
      exporter: {
        templateFile: './data/exporter.template.xlsx',
        worksheets: [
          { name: 'Exported (sections 1, 2 and 3)', fn: generateExportedRow },
          { name: 'Sent on (sections 4 and 5)', fn: generateSentOnRow }
        ]
      },
      reprocessorOutput: {
        templateFile: './data/reprocessor.output.template.xlsx',
        worksheets: [
          { name: 'Received (sections 1 and 2)', fn: generateReceivedRow },
          {
            name: 'Reprocessed (sections 3 and 4)',
            fn: generateOutputReprocessedRow
          },
          { name: 'Sent on (sections 5 and 6)', fn: generateOutputSentOnRow }
        ]
      },
      reprocessorInput: {
        templateFile: './data/reprocessor.input.template.xlsx',
        worksheets: [
          {
            name: 'Received (sections 1, 2 and 3)',
            fn: generateInputReceivedRow
          },
          { name: 'Reprocessed (section 4)', fn: generateInputReprocessedRow },
          { name: 'Sent on (sections 5, 6 and 7)', fn: generateInputSentOnRow }
        ]
      },
      regOnlyExporter: {
        templateFile: './data/exporter.reg.only.template.xlsx',
        worksheets: [
          { name: 'Received (section 1)', fn: generateRegOnlyReceivedRow },
          {
            name: 'Exported (sections 2 and 3)',
            fn: generateRegOnlyExportedRow
          },
          { name: 'Sent on (section 4)', fn: generateRegOnlySentOnRow }
        ]
      },
      regOnlyReprocessor: {
        templateFile: './data/reprocessor.reg.only.template.xlsx',
        worksheets: [
          {
            name: 'Received (section 1)',
            fn: generateRegOnlyReprocessorReceivedRow
          },
          {
            name: 'Sent on (section 2)',
            fn: generateRegOnlyReprocessorSentOnRow
          }
        ]
      }
    }

    const config = PROCESSING_TYPE_CONFIG[wasteProcessingType]
    if (!config) {
      throw new Error(`Unknown wasteProcessingType: ${wasteProcessingType}`)
    }

    let { templateFile, worksheets } = config

    if (filename !== null) {
      templateFile = filename
    }

    // Create workbook and read the template
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(templateFile)

    // Update the Cover sheet only if we are using the default template
    if (filename === null) {
      const coverSheet = workbook.getWorksheet('Cover')
      if (coverSheet) {
        coverSheet.getCell('E7').value = material.dropdownValue
        coverSheet.getCell('E10').value = registrationNumber
        if (!wasteProcessingType.startsWith('regOnly')) {
          coverSheet.getCell('E13').value = accreditationNumber
          logger.info(
            `Updated Cover sheet -- Material: ${material.material}, Registration: ${registrationNumber}, Accreditation: ${accreditationNumber}`
          )
        } else {
          logger.info(
            `Updated Cover sheet -- Material: ${material.material}, Registration: ${registrationNumber}`
          )
        }
      } else {
        logger.warn('Cover sheet not found')
      }
    }

    for (const [index, worksheet] of worksheets.entries()) {
      const sheet = workbook.getWorksheet(worksheet.name)
      if (sheet) {
        if (sheets !== null && !sheets.includes(index)) {
          logger.info(
            `Skipping ${worksheet.name} (sheet ${index} not in SHEETS)`
          )
          continue
        }
        logger.info(`Generating data for ${worksheet.name}...`)

        let currentRow = 4 + rowOffset // Start from row 4

        let targetCols = ['B']
        if (
          worksheet.name === 'Received (sections 1, 2 and 3)' ||
          worksheet.name === 'Received (sections 1 and 2)' ||
          worksheet.name === 'Exported (sections 1, 2 and 3)'
        ) {
          targetCols = ['B', 'N', 'S']
        } else if (worksheet.name === 'Reprocessed (sections 3 and 4)') {
          targetCols = ['B', 'J']
        } else if (worksheet.name === 'Received (section 1)') {
          targetCols = ['B', 'G', 'K', 'Q']
        }
        workbook.eachSheet((sheet) => {
          sheet.eachRow((row) => {
            targetCols.forEach((col) => {
              const cell = row.getCell(col)
              if (
                cell.type === ExcelJS.ValueType.Formula ||
                cell.type === ExcelJS.ValueType.SharedFormula
              ) {
                cell.value = cell.result ?? null
              }
            })
          })
        })

        for (let i = rowOffset; i < numberOfRows + rowOffset; i++) {
          const rowData = worksheet.fn(material)

          function calculateTonnage(rowData) {
            rowData.N = rowData.K - (rowData.L + rowData.M)
            if (rowData.O === 'Yes') {
              rowData.S = (rowData.N - rowData.Q) * 0.9985 * rowData.R
            } else {
              rowData.S = (rowData.N - rowData.Q) * rowData.R
            }
          }

          const WORKSHEET_CONFIG = {
            reprocessorInput: {
              'Received (sections 1, 2 and 3)': {
                rowId: 1000,
                tonnage: calculateTonnage
              },
              'Reprocessed (section 4)': { rowId: 4000 },
              'Sent on (sections 5, 6 and 7)': { rowId: 5000 }
            },
            reprocessorOutput: {
              'Received (sections 1 and 2)': {
                rowId: 1000,
                tonnage: calculateTonnage
              },
              'Reprocessed (sections 3 and 4)': {
                rowId: 3000,
                tonnage: (r) => {
                  r.J = r.H * r.I
                }
              },
              'Sent on (sections 5 and 6)': { rowId: 5000 }
            },
            exporter: {
              'Exported (sections 1, 2 and 3)': {
                rowId: 1000,
                tonnage: calculateTonnage
              },
              'Sent on (sections 4 and 5)': { rowId: 4000 }
            },
            regOnlyReprocessor: {
              'Received (section 1)': {
                rowId: 1000,
                tonnage: (r) => {
                  r.K = r.H * r.J
                }
              },
              'Sent on (section 2)': { rowId: 5000 }
            },
            regOnlyExporter: {
              'Received (section 1)': {
                rowId: 1000,
                tonnage: (r) => {
                  r.Q = r.N * r.P
                }
              },
              'Exported (sections 2 and 3)': { rowId: 2000 },
              'Sent on (section 4)': { rowId: 4000 }
            }
          }

          // Apply config
          const config = WORKSHEET_CONFIG[wasteProcessingType]?.[worksheet.name]
          if (config) {
            rowData.B = `${config.rowId + i}`
            config.tonnage?.(rowData)
          }

          // Insert data only into specified columns
          Object.entries(rowData).forEach(([columnLetter, value]) => {
            const cell = sheet.getCell(`${columnLetter}${currentRow}`)
            cell.value = value
            const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/
            if (typeof value === 'string' && dateRegex.test(value)) {
              const [day, month, year] = value.split('/')
              const parsed = new Date(year, month - 1, day, 12, 0, 0)
              if (!isNaN(parsed)) {
                cell.value = parsed
                cell.numFmt = 'dd/mm/yyyy'
              }
            }
          })

          currentRow++
        }

        logger.info(
          `Generated ${numberOfRows} rows for ${worksheet.name} (rows ${4 + rowOffset}-${currentRow - 1})`
        )
      }
    }

    const safeType = sanitiseFilenameComponent(wasteProcessingType)
    const safeAcc = sanitiseFilenameComponent(accreditationNumber)
    const safeReg = sanitiseFilenameComponent(registrationNumber)

    const sheetsSuffix = sheets !== null ? `_sheets${sheets.join('-')}` : ''

    let outputFile
    if (!wasteProcessingType.startsWith('regOnly')) {
      outputFile = `./data/${safeType}_${safeAcc}_${safeReg}${sheetsSuffix}.xlsx`
    } else {
      outputFile = `./data/${safeType}_${safeReg}${sheetsSuffix}.xlsx`
    }
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

if (process.env.SHEETS) {
  options.sheets = process.env.SHEETS.split(',').map(Number)
}

if (process.env.FILENAME) {
  options.filename = process.env.FILENAME
}

if (process.env.ROW_OFFSET) {
  options.rowOffset = parseInt(process.env.ROW_OFFSET, 10)
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
  } else if (arg.startsWith('--sheets=')) {
    options.sheets = arg.split('=')[1].split(',').map(Number)
  } else if (arg.startsWith('--filename=')) {
    options.filename = arg.split('=')[1]
  } else if (arg.startsWith('--rowOffset=')) {
    options.rowOffset = parseInt(arg.split('=')[1], 10)
  }
})

generateSpreadsheetData(options)
