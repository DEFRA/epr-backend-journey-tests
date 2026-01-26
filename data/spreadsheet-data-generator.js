import ExcelJS from 'exceljs'
import { fakerEN_GB as faker } from '@faker-js/faker'
import logger from '../test/support/logger.js'

// Material options matching your system
const MATERIALS = [
  {
    dropdownValue: 'Aluminium',
    material: 'Aluminium',
    code: 'R4',
    suffix: 'AL'
  },
  {
    dropdownValue: 'Fibre_based_composite',
    material: 'Fibre-based composite material',
    code: 'R3',
    suffix: 'FB'
  },
  {
    dropdownValue: 'Glass_remelt',
    material: 'Glass',
    code: 'R5',
    suffix: 'GL'
  },
  { dropdownValue: 'Glass_other', material: 'Glass', code: 'R5', suffix: 'GL' },
  {
    dropdownValue: 'Paper_and_board',
    material: 'Paper or board',
    code: 'R3',
    suffix: 'PA'
  },
  { dropdownValue: 'Plastic', material: 'Plastic', code: 'R3', suffix: 'PL' },
  { dropdownValue: 'Steel', material: 'Steel', code: 'R4', suffix: 'ST' },
  { dropdownValue: 'Wood', material: 'Wood', code: 'R3', suffix: 'WO' }
]

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

// Generate a single row for "Received" sections
function generateReceivedRow(material) {
  const date = faker.date.recent({ days: 90 })

  return {
    G: date.toLocaleDateString('en-US'), // Column G: Date received
    H: '01 03 04*', // Column H: EWC Code
    I: 'Aluminium - other', // Column I
    J: 'No', // Column J: PRN issued
    K: faker.number.float({ min: 50, max: 500, precision: 0.01 }), // Column K: Gross weight
    L: faker.number.float({ min: 5.0, max: 30, precision: 0.01 }), // Column L: Tare weight
    M: faker.number.float({ min: 5.0, max: 10, precision: 0.01 }), // Column M: Pallet weight
    O: 'Yes', // Column O: Pallet weight
    P: 'National protocol percentage', // Column P
    Q: 5.0, // Column Q
    R: '3%' // Column R
  }
}

async function generateSpreadsheetData(options = {}) {
  const {
    inputFile = './reprocessor.input.template.xlsx',
    outputFile = './Summary_Log_Generated.xlsx',
    rowsPerSection = 10,
    materialSuffix = null
  } = options

  try {
    logger.info('Reading spreadsheet template...')

    // Create workbook and read the template
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(inputFile)

    logger.info(`Found ${workbook.worksheets.length} sheets`)

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

    logger.info(`Selected material: ${material.material} (${material.suffix})`)

    const regNumber = generateRegNumber(material.suffix)
    const accNumber = generateAccNumber(material.suffix)

    // Update the Cover sheet
    const coverSheet = workbook.getWorksheet('Cover')
    if (coverSheet) {
      coverSheet.getCell('E7').value = material.dropdownValue
      coverSheet.getCell('E10').value = regNumber
      coverSheet.getCell('E13').value = accNumber

      logger.info('✓ Updated Cover sheet')
      logger.info(`  E7 (Material): ${material.material}`)
      logger.info(`  E10 (Registration): ${regNumber}`)
      logger.info(`  E13 (Accreditation): ${accNumber}`)
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
      const totalRows = rowsPerSection * 3 // Sections 1, 2, 3

      for (let i = 0; i < totalRows; i++) {
        const rowData = generateReceivedRow(material)

        // Insert data only into specified columns
        Object.entries(rowData).forEach(([columnLetter, value]) => {
          const cell = receivedSheet.getCell(`${columnLetter}${currentRow}`)
          cell.value = value
        })

        currentRow++
      }

      logger.info(
        `✓ Generated ${totalRows} rows for Received sheet (rows 4-${currentRow - 1})`
      )
      logger.info(
        `  Populated columns: ${Object.keys(generateReceivedRow(material)).join(', ')}`
      )
    } else {
      logger.warn('Received sheet not found')
    }

    // Write the updated workbook
    logger.info(`Writing to ${outputFile}...`)
    await workbook.xlsx.writeFile(outputFile)

    logger.info(`✓ Successfully generated spreadsheet: ${outputFile}`)
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
