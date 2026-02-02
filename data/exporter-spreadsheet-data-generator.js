import ExcelJS from 'exceljs'
import { fakerEN_GB as faker } from '@faker-js/faker'
import logger from '../test/support/logger.js'
import EWC_CODES from './ewc-codes.js'
import BASEL_CODES from './basel-codes.js'
import {
  RECYCLABLE_PROPORTION_METHODS,
  YES_NO,
  ACTIVITIES,
  MATERIALS,
  EXPORT_CONTROLS,
  countryList
} from './shared-spreadsheet-values.js'

// Generate fake registration/accreditation numbers
function generateRegNumber(suffix) {
  const year = new Date().getFullYear().toString().slice(-2)
  const random = Math.floor(Math.random() * 9000) + 1000
  return `R${year}SR500${random}${suffix}`
}

function generateAccNumber(suffix) {
  const random = Math.floor(Math.random() * 900000) + 100000
  return `ACC${random}${suffix}`
}

function generateSentOnRow(material) {
  const date = faker.date.recent({ days: 20 })

  return {
    // Section 4
    G: date.toLocaleDateString('en-US'), // Date load left site
    H: faker.number.float({ min: 5, max: 20, precision: 0.01 }), // Tonnage of UK packaging waste sent on
    I: 'Exporter', // Final destination facility type
    J: faker.company.name(), // Final destination facility name
    K: faker.location.streetAddress(), // First line of final destination facility address
    L: faker.location.zipCode(), // Final destination facility postcode

    // Section 5
    Q: faker.internet.email(), // Final destination facility email
    R: faker.phone.number(), // Final destination facility phone number
    S: `W${faker.number.int({ min: 100000, max: 999999 })}`, // Your reference
    T: faker.helpers.arrayElement(material.wasteDescriptions), // Description of waste sent on
    U: faker.helpers.arrayElement(EWC_CODES), // EWC code
    V: `WB-${faker.number.int({ min: 10000, max: 999999 })}` // Weighbridge ticket number or scales reference
  }
}

// Generate a single row for "Exported" sections
function generateExportedRow(material) {
  const date = faker.date.recent({ days: 20 })
  const dateOfExport = faker.date.recent({ days: 5 })
  const interimSite = faker.helpers.arrayElement(YES_NO)

  const reprocessorCountry = faker.helpers.arrayElement(countryList)

  let interimSiteId = ''
  let interimSiteTonnage = ''

  if (interimSite === 'Yes') {
    interimSiteId = faker.number.int({ min: 100, max: 999 })
    interimSiteTonnage = faker.number.float({ min: 1, max: 5, precision: 0.01 })
  }

  return {
    // Section 1
    G: date.toLocaleDateString('en-US'), // Column G: Date received for export
    H: faker.helpers.arrayElement(EWC_CODES), // Column H: EWC Code
    I: faker.helpers.arrayElement(material.wasteDescriptions), // Column I: Waste description
    J: faker.helpers.arrayElement(YES_NO), // Column J: PRN issued
    K: faker.number.float({ min: 50, max: 500, precision: 0.01 }), // Column K: Gross weight
    L: faker.number.float({ min: 5.0, max: 30, precision: 0.01 }), // Column L: Tare weight
    M: faker.number.float({ min: 5.0, max: 10, precision: 0.01 }), // Column M: Pallet weight
    O: faker.helpers.arrayElement(YES_NO), // Column O: Baling wire protocol
    P: faker.helpers.arrayElement(RECYCLABLE_PROPORTION_METHODS), // Column P: How did you calculate the recyclable proportion?
    Q: faker.number.float({ min: 5, max: 10, precision: 0.01 }), // Column Q: Weight of non-target material and contaminants
    R: faker.number.float({ min: 0.05, max: 0.8 }), // Column R: Recyclable Percentage
    T: faker.number.float({ min: 1, max: 5, precision: 0.01 }), // Column T: Tonnage of UK packaging waste exported
    U: dateOfExport.toLocaleDateString('en-US'), // Column U: Date of export
    V: faker.helpers.arrayElement(BASEL_CODES), // basel export code
    W: faker.number.int({ min: 3000000000, max: 4000000000 }), // customs code (HS code)
    X:
      faker.string.alpha({ count: 4, casing: 'upper' }) +
      faker.number.int({ min: 1000000, max: 10000000 }), // Container or trailer number / IMO vessel if bulk shipment
    Y: faker.date.recent({ days: 2 }).toLocaleString('en-US'), // Date received by approved overseas reprocessor
    Z: faker.number.int({ min: 400, max: 700 }), // Approved overseas reprocessor's ID
    AA: interimSite, // Did you export the waste through an interim site? (If yes, provide information for AB and AC)
    AB: interimSiteId, // Interim Site ID (If applicable)
    AC: interimSiteTonnage, // If exported through an interim site, tonnage of UK packaging waste received by overseas reprocessor

    // Section 2
    AH: faker.company.name(), // Column AH: Supplier name
    AI: faker.location.streetAddress(), // Column AI: First line of supplier address
    AJ: faker.location.zipCode(), // Column AJ: Supplier postcode
    AK: faker.internet.email(), // Column AK: Supplier email
    AL: faker.phone.number(), // Column AL: Supplier phone number
    AM: faker.helpers.arrayElement(ACTIVITIES), // Column AM: Activities carried out by supplier on the packaging waste (For example, sorting)
    AN: faker.helpers.arrayElement(YES_NO), // Column AN: Was the waste refused by the recipient destination?
    AO: faker.helpers.arrayElement(YES_NO), // Column AO: Was the waste stopped during the course of export?
    AP: faker.date.recent({ days: 30 }).toLocaleDateString('en-US'), // Column AP: Date that the stopped or refused waste was repatriated

    // Section 3
    AU: `W${faker.number.int({ min: 100000, max: 999999 })}`, // Your reference
    AV: `WB-${faker.number.int({ min: 10000, max: 999999 })}`, // Weighbridge ticket number
    AW:
      'WTN-' +
      faker.number.int({ min: 1000, max: 9999 }) +
      '-' +
      faker.number.int({ min: 10000, max: 99999 }), // Waste Transfer Note or Hazardous Waste Consignment Note reference number
    AX: faker.company.name(), // Loading site name (If different from supplier)
    AY: faker.location.streetAddress(), // First line of loading site address
    AZ: faker.location.zipCode(), // Loading site postcode
    BA: faker.internet.email(), // Loading site email
    BB: faker.phone.number(), // Loading site phone number
    BC: faker.company.name() + ' Ltd', // Carrier name
    BD: `CBDU${faker.number.int({ min: 10000000, max: 99999999 })}`, // Registration number of waste carrier, broker
    BE: faker.vehicle.vrm(), // Supplier phone number
    BF: faker.helpers.arrayElement(EXPORT_CONTROLS), // Export Controls
    BG:
      'UK-BOL-' +
      faker.number.int({ min: 1000000, max: 9999999 }) +
      '-' +
      faker.number.int({ min: 1000, max: 9999 }), // Bill of lading reference number
    BH:
      'CDR-UK-HMRC-' +
      faker.number.int({ min: 10000000, max: 99999999 }) +
      '-' +
      faker.number.int({ min: 100, max: 999 }), // Customs declaration form reference number
    BI: faker.company.name() + ' Limited', // Approved overseas reprocessor's site name
    BJ: reprocessorCountry.name + '-' + reprocessorCountry.code, // Approved overseas reprocessor's country
    BK: faker.number.float({ min: 1, max: 5, precision: 0.01 }) // If not exported through an interim site, tonnage of UK packaging waste received by overseas reprocessor
  }
}

async function generateSpreadsheetData(options = {}) {
  const {
    inputFile = './data/exporter.template.xlsx',
    outputFile = './data/Summary_Log_Exporter.xlsx',
    numberOfRows = 10,
    materialSuffix = null
  } = options

  try {
    logger.info('Reading spreadsheet template...')

    // Create workbook and read the template
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(inputFile)

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

    const regNumber = generateRegNumber(material.suffix)
    const accNumber = generateAccNumber(material.suffix)

    // Update the Cover sheet
    const coverSheet = workbook.getWorksheet('Cover')
    if (coverSheet) {
      coverSheet.getCell('E7').value = material.dropdownValue
      coverSheet.getCell('E10').value = regNumber
      coverSheet.getCell('E13').value = accNumber

      logger.info(
        `Updated Cover sheet -- Material: ${material.material}, Registration: ${regNumber}, Accreditation: ${accNumber}`
      )
    } else {
      logger.warn('Cover sheet not found')
    }

    // Update the Exported sheet (sections 1, 2 and 3)
    const exportedSheet = workbook.getWorksheet(
      'Exported (sections 1, 2 and 3)'
    )
    if (exportedSheet) {
      logger.info('Generating data for Exported sheet...')

      let currentRow = 4 // Start from row 4

      for (let i = 0; i < numberOfRows; i++) {
        const rowData = generateExportedRow(material)

        // Fix an issue where first row of net weight is not populated
        if (i === 0) {
          rowData.N = rowData.K - (rowData.L + rowData.M)
        }

        // Insert data only into specified columns
        Object.entries(rowData).forEach(([columnLetter, value]) => {
          const cell = exportedSheet.getCell(`${columnLetter}${currentRow}`)
          cell.value = value
        })

        currentRow++
      }

      logger.info(
        `Generated ${numberOfRows} rows for Received sheet (rows 4-${currentRow - 1})`
      )
    } else {
      logger.warn('Received sheet not found')
    }

    // Update the Sent On sheet (Sections 5 and 6)
    const sentOnSheet = workbook.getWorksheet('Sent on (sections 4 and 5)')
    if (sentOnSheet) {
      logger.info('Generating data for Sent On sheet...')

      let currentRow = 4 // Start from row 4
      const totalRows = numberOfRows

      for (let i = 0; i < totalRows; i++) {
        const rowData = generateSentOnRow(material)

        // Insert data only into specified columns
        Object.entries(rowData).forEach(([columnLetter, value]) => {
          const cell = sentOnSheet.getCell(`${columnLetter}${currentRow}`)
          cell.value = value
        })

        currentRow++
      }

      logger.info(
        `Generated ${totalRows} rows for Sent On sheet (rows 4-${currentRow - 1})`
      )
    } else {
      logger.warn('Sent On sheet not found')
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

if (process.env.ROWS_PER_SECTION) {
  options.rowsPerSection = parseInt(process.env.ROWS_PER_SECTION, 10)
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
    options.rowsPerSection = parseInt(arg.split('=')[1], 10)
  } else if (arg.startsWith('--input=')) {
    options.inputFile = arg.split('=')[1]
  } else if (arg.startsWith('--output=')) {
    options.outputFile = arg.split('=')[1]
  } else if (arg.startsWith('--accNumber=')) {
    options.accNumber = arg.split('=')[1]
  } else if (arg.startsWith('--regNumber=')) {
    options.regNumber = arg.split('=')[1]
  }
})

generateSpreadsheetData(options)
