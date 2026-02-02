import ExcelJS from 'exceljs'
import { fakerEN_GB as faker } from '@faker-js/faker'
import logger from '../test/support/logger.js'
import EWC_CODES from './ewc-codes.js'
import {
  RECYCLABLE_PROPORTION_METHODS,
  YES_NO,
  ACTIVITIES,
  MATERIALS
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
    // Section 5
    G: date.toLocaleDateString('en-US'), // Date load left site
    H: faker.number.float({ min: 5, max: 20, precision: 0.01 }), // Tonnage of UK packaging waste sent on
    I: 'Reprocessor', // Final destination facility type
    J: faker.company.name(), // Final destination facility name
    K: faker.location.streetAddress(), // First line of final destination facility address
    L: faker.location.zipCode(), // Final destination facility postcode

    // Section 6
    Q: faker.internet.email(), // Final destination facility email
    R: faker.phone.number(), // Final destination facility phone number
    S: `W${faker.number.int({ min: 100000, max: 999999 })}`, // Your reference
    T: faker.helpers.arrayElement(material.wasteDescriptions), // Description of waste sent on
    U: faker.helpers.arrayElement(EWC_CODES), // EWC code
    V: `WB-${faker.number.int({ min: 10000, max: 999999 })}` // Weighbridge ticket number or scales reference
  }
}

// Generate a single row for "Received" sections
function generateReceivedRow(material) {
  const date = faker.date.recent({ days: 20 })

  return {
    // Section 1
    G: date.toLocaleDateString('en-US'), // Column G: Date received
    H: faker.helpers.arrayElement(EWC_CODES), // Column H: EWC Code
    I: faker.helpers.arrayElement(material.wasteDescriptions), // Column I
    J: faker.helpers.arrayElement(YES_NO), // Column J: PRN issued
    K: faker.number.float({ min: 50, max: 500, precision: 0.01 }), // Column K: Gross weight
    L: faker.number.float({ min: 5.0, max: 30, precision: 0.01 }), // Column L: Tare weight
    M: faker.number.float({ min: 5.0, max: 10, precision: 0.01 }), // Column M: Pallet weight
    O: faker.helpers.arrayElement(YES_NO), // Column O: Baling wire protocol
    P: faker.helpers.arrayElement(RECYCLABLE_PROPORTION_METHODS), // Column P: How did you calculate the recyclable proportion?
    Q: faker.number.float({ min: 5, max: 10, precision: 0.01 }), // Column Q: Weight of non-target material and contaminants
    R: faker.number.float({ min: 0.05, max: 0.8 }), // Column R: Recyclable Percentage

    T: faker.company.name(), // Column T: Supplier name
    U: faker.location.streetAddress(), // Column U: First line of supplier address
    V: faker.location.zipCode(), // Column V: Supplier postcode
    W: faker.internet.email(), // Column W: Supplier email
    X: faker.phone.number(), // Column X: Supplier phone number
    Y: faker.helpers.arrayElement(ACTIVITIES), // Column Y: Activities carried out by supplier on the packaging waste (For example, sorting)

    // Section 2
    AD: `W${faker.number.int({ min: 100000, max: 999999 })}`, // Your reference
    AE: `WB-${faker.number.int({ min: 10000, max: 999999 })}`, // Weighbridge ticket number
    AF: faker.company.name() + ' Ltd', // Carrier name (if applicable)
    AG: `CBDU${faker.number.int({ min: 10000000, max: 99999999 })}`, // Registration number of waste carrier, broker
    AH: faker.vehicle.vrm() // Supplier phone number
  }
}

// Generate a single row for "Reprocessed" sections
function generateReprocessedRow() {
  const date = faker.date.recent({ days: 20 })

  return {
    // Section 3
    G: date.toLocaleDateString('en-US'), // Date load left site
    H: faker.number.float({ min: 50, max: 500, precision: 0.01 }), // Product tonnage
    I: faker.number.float({ min: 0.05, max: 0.8 }), // Column I: Percentage was UK packaging waste
    K: faker.helpers.arrayElement(YES_NO), // Column K: Eligible for waste balance?

    // Section 4
    P: faker.word.verb(), // Column P: Description of product
    Q: faker.helpers.arrayElement(YES_NO), // Column Q: End of waste standards
    R: `WB-${faker.number.int({ min: 10000, max: 999999 })}`, // Weighbridge ticket number  or scales reference
    S: faker.company.name(), // Haulier name
    T: faker.vehicle.vrm(), // Haulier vehicle registration
    U: faker.company.name(), // Name of customer
    V: `INV-${faker.number.int({ min: 10000000, max: 99999999 })}` // Customer invoice or contract reference
  }
}

async function generateSpreadsheetData(options = {}) {
  const {
    inputFile = './data/reprocessor.output.template.xlsx',
    outputFile = './data/Summary_Log_Output.xlsx',
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

    // Update the Received sheet (sections 1 and 2)
    const receivedSheet = workbook.getWorksheet('Received (sections 1 and 2)')
    if (receivedSheet) {
      logger.info('Generating data for Received sheet...')

      let currentRow = 4 // Start from row 4

      for (let i = 0; i < numberOfRows; i++) {
        const rowData = generateReceivedRow(material)

        // Fix an issue where first row of net weight is not populated
        if (i === 0) {
          rowData.N = rowData.K - (rowData.L + rowData.M)
        }

        // Insert data only into specified columns
        Object.entries(rowData).forEach(([columnLetter, value]) => {
          const cell = receivedSheet.getCell(`${columnLetter}${currentRow}`)
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

    // Update the Reprocessed sheet (Section 4)
    const reprocessedSheet = workbook.getWorksheet(
      'Reprocessed (sections 3 and 4)'
    )
    if (reprocessedSheet) {
      logger.info('Generating data for Reprocessed sheet...')

      let currentRow = 4 // Start from row 4
      const totalRows = numberOfRows

      for (let i = 0; i < totalRows; i++) {
        const rowData = generateReprocessedRow()

        // Fix an issue where first row of product tonnage is not populated
        if (i === 0) {
          rowData.J = rowData.H * rowData.I
        }

        // Insert data only into specified columns
        Object.entries(rowData).forEach(([columnLetter, value]) => {
          const cell = reprocessedSheet.getCell(`${columnLetter}${currentRow}`)
          cell.value = value
        })

        currentRow++
      }

      logger.info(
        `Generated ${totalRows} rows for Reprocessed sheet (rows 4-${currentRow - 1})`
      )
    } else {
      logger.warn('Reprocessed sheet not found')
    }

    // Update the Sent On sheet (Sections 5 and 6)
    const sentOnSheet = workbook.getWorksheet('Sent on (sections 5 and 6)')
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

args.forEach((arg) => {
  if (arg.startsWith('--material=')) {
    options.materialSuffix = arg.split('=')[1]
  } else if (arg.startsWith('--rows=')) {
    options.rowsPerSection = parseInt(arg.split('=')[1], 10)
  } else if (arg.startsWith('--input=')) {
    options.inputFile = arg.split('=')[1]
  } else if (arg.startsWith('--output=')) {
    options.outputFile = arg.split('=')[1]
  }
})

generateSpreadsheetData(options)
