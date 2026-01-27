import ExcelJS from 'exceljs'
import { fakerEN_GB as faker } from '@faker-js/faker'
import logger from '../test/support/logger.js'
import EWC_CODES from './ewc-codes.js'

// Material options matching your system
const MATERIALS = Object.freeze([
  {
    dropdownValue: 'Aluminium',
    material: 'Aluminium',
    code: 'R4',
    suffix: 'AL',
    wasteDescriptions: [
      'Aluminium - other',
      'Aluminium - AAIG aluminium cans and associated packaging (97.5%)',
      'Aluminium - aluminium extracted and processed from IBA (87.5%)'
    ]
  },
  {
    dropdownValue: 'Fibre_based_composite',
    material: 'Fibre-based composite material',
    code: 'R3',
    suffix: 'FB',
    wasteDescriptions: [
      'Fibre-based composite - cups',
      'Fibre-based composite - drink cartons',
      'Fibre-based composite - food containers',
      'Fibre-based composite - mixed'
    ]
  },
  {
    dropdownValue: 'Glass_remelt',
    material: 'Glass',
    code: 'R5',
    suffix: 'GR',
    wasteDescriptions: [
      'Glass - pre-sorted',
      'Glass - bottle bank glass or commercial glass waste',
      'Glass - MRF derived glass'
    ]
  },
  {
    dropdownValue: 'Glass_other',
    material: 'Glass',
    code: 'R5',
    suffix: 'GO',
    wasteDescriptions: [
      'Glass - pre-sorted',
      'Glass - bottle bank glass or commercial glass waste',
      'Glass - MRF derived glass'
    ]
  },
  {
    dropdownValue: 'Paper_and_board',
    material: 'Paper or board',
    code: 'R3',
    suffix: 'PA',
    wasteDescriptions: [
      'Paper - other',
      'Paper - AAIG EN643 grade 1.04.01 (70%)',
      'Paper - AAIG EN643 grade 1.04.02 (80%)',
      'Paper - AAIG EN643 grades 1.04.00, 1.05.00 and 1.05.01 (97.5%)',
      'Paper - sorted mixed paper or board ',
      'Paper - unsorted mixed paper or board (unusable materials removed)'
    ]
  },
  {
    dropdownValue: 'Plastic',
    material: 'Plastic',
    code: 'R3',
    suffix: 'PL',
    wasteDescriptions: [
      'Plastic - HDPE bottles',
      'Plastic - HDPE other ',
      'Plastic - LDPE film clear',
      'Plastic - LDPE film coloured',
      'Plastic - mixed plastic',
      'Plastic - mixed rigid plastic',
      'Plastic - mixed bottles',
      'Plastic - PET bottles',
      'Plastic - PET flake',
      'Plastic - PET other',
      'Plastic - polystyrene',
      'Plastic - PP other',
      'Plastic - PP pots, tubs and trays',
      'Plastic - PVC packaging'
    ]
  },
  {
    dropdownValue: 'Steel',
    material: 'Steel',
    code: 'R4',
    suffix: 'ST',
    wasteDescriptions: [
      'Steel - 1 and 2 mixed',
      'Steel - 2',
      'Steel - 4C',
      'Steel - 4E',
      'Steel - 8B',
      'Steel - fragmentised',
      'Steel – AAIG steel cans and associated packaging, grade 6E (97.5%)',
      'Steel - other'
    ]
  },
  {
    dropdownValue: 'Wood',
    material: 'Wood',
    code: 'R3',
    suffix: 'WO',
    wasteDescriptions: ['Wood - grade A', 'Wood - grade B', 'Wood - mixed ']
  }
])

const ACTIVITIES = Object.freeze(['Sorting', 'Baling'])

const RECYCLABLE_PROPORTION_METHODS = Object.freeze([
  'AAIG percentage',
  'Actual weight (100%)',
  'National protocol percentage',
  'S&I plan agreed methodology',
  'S&I plan agreed site-specific protocol percentage'
])

const YES_NO = Object.freeze(['Yes', 'No'])

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

// function sentOnRow() {
//   const date = faker.date.recent({ days: 30 })
//
//   return {
//     // Section 5
//     G: date.toLocaleDateString('en-US'), // Date load left site
//     H: faker.number.float({ min: 50, max: 500, precision: 0.01 }) // Tonnage of UK packaging waste sent on
//
//     // Section 6
//     // J: faker.helpers.arrayElement(YES_NO), // UK packaging waste sent on was recycled?
//   }
// }

// Generate a single row for "Received" sections
function generateReceivedRow(material) {
  const date = faker.date.recent({ days: 30 })

  return {
    // Section 1
    G: date.toLocaleDateString('en-US'), // Column G: Date received
    H: faker.helpers.arrayElement(EWC_CODES), // Column H: EWC Code
    I: faker.helpers.arrayElement(material.wasteDescriptions), // Column I
    J: faker.helpers.arrayElement(YES_NO), // Column J: PRN issued
    K: faker.number.float({ min: 50, max: 500, precision: 0.01 }), // Column K: Gross weight
    L: faker.number.float({ min: 5.0, max: 30, precision: 0.01 }), // Column L: Tare weight
    M: faker.number.float({ min: 5.0, max: 10, precision: 0.01 }), // Column M: Pallet weight
    O: faker.helpers.arrayElement(YES_NO), // Column O: Pallet weight
    P: faker.helpers.arrayElement(RECYCLABLE_PROPORTION_METHODS), // Column P
    Q: faker.number.float({ min: 5, max: 10, precision: 0.01 }), // Column Q
    R: `${faker.number.int({ min: 5, max: 80 })}%`, // Column R

    // Section 2
    X: faker.company.name(), // Supplier name
    Y: faker.location.streetAddress(), //First line of supplier address
    Z: faker.location.zipCode(), // Supplier postcode
    AA: faker.internet.email(), // Supplier email
    AB: faker.phone.number(), // Supplier phone number
    AC: faker.helpers.arrayElement(ACTIVITIES), // Activities carried out by supplier on the packaging waste (For example, sorting)

    // Section 3
    AH: `W${faker.number.int({ min: 100000, max: 999999 })}`, // Your reference
    AI: `WB-${faker.number.int({ min: 10000, max: 999999 })}`, // Weighbridge ticket number
    AJ: faker.company.name() + ' Ltd', // Carrier name (if applicable)
    AK: `CBDU${faker.number.int({ min: 10000000, max: 99999999 })}`, // Registration number of waste carrier, broker
    AL: faker.vehicle.vrm() // Supplier phone number
  }
}

// Generate a single row for "Reprocessed" sections
function generateReprocessedRow() {
  const date = faker.date.recent({ days: 30 })

  return {
    // Section 4
    G: date.toLocaleDateString('en-US'), // Date load left site
    H: faker.word.verb(), // Description of product
    I: faker.helpers.arrayElement(YES_NO), // End of waste standards?
    J: faker.number.float({ min: 50, max: 500, precision: 0.01 }), // Product tonnage
    K: `WB-${faker.number.int({ min: 10000, max: 999999 })}`, // Weighbridge ticket number  or scales reference
    L: faker.company.name(), // Haulier name
    M: faker.vehicle.vrm(), // Haulier vehicle registration
    N: faker.company.name(), // Name of customer
    O: `INV-${faker.number.int({ min: 10000000, max: 99999999 })}` // Customer invoice or contract reference
  }
}

async function generateSpreadsheetData(options = {}) {
  const {
    inputFile = './reprocessor.input.template.xlsx',
    outputFile = './Summary_Log_Generated.xlsx',
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

    // Update the Received sheet (Sections 1, 2, 3)
    const receivedSheet = workbook.getWorksheet(
      'Received (sections 1, 2 and 3)'
    )
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
    const reprocessedSheet = workbook.getWorksheet('Reprocessed (section 4)')
    if (reprocessedSheet) {
      logger.info('Generating data for Reprocessed sheet...')

      let currentRow = 4 // Start from row 4
      const totalRows = numberOfRows

      for (let i = 0; i < totalRows; i++) {
        const rowData = generateReprocessedRow()

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
