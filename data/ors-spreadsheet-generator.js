import ExcelJS from 'exceljs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const resourcesDir = path.join(__dirname, '..', 'resources')

/**
 * Creates an ORS spreadsheet with the required structure:
 * - Sheet name: "ORS ID Log"
 * - Row 4, Col D: Packaging waste category
 * - Row 5, Col D: Org ID
 * - Row 6, Col D: Registration number
 * - Row 7, Col D: Accreditation number
 * - Data rows from row 10, columns B-K
 */
const createOrsSpreadsheet = async (filename, { metadata, sites }) => {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('ORS ID Log')

  // Header labels in column C
  worksheet.getRow(4).getCell(3).value = 'Packaging waste category'
  worksheet.getRow(5).getCell(3).value = 'Organisation ID'
  worksheet.getRow(6).getCell(3).value = 'Registration number'
  worksheet.getRow(7).getCell(3).value = 'Accreditation number'

  // Metadata values in column D
  worksheet.getRow(4).getCell(4).value = metadata.packagingWasteCategory
  worksheet.getRow(5).getCell(4).value = metadata.orgId
  worksheet.getRow(6).getCell(4).value = metadata.registrationNumber
  worksheet.getRow(7).getCell(4).value = metadata.accreditationNumber

  // Column headers in row 9
  const headers = [
    '', // A (unused)
    'ORS ID', // B
    'Country', // C
    'Name', // D
    'Address Line 1', // E
    'Address Line 2', // F
    'Town/City', // G
    'State/Region', // H
    'Postcode', // I
    'Coordinates', // J
    'Valid From' // K
  ]
  const headerRow = worksheet.getRow(9)
  headers.forEach((header, index) => {
    headerRow.getCell(index + 1).value = header
  })

  // Data rows from row 10
  sites.forEach((site, index) => {
    const row = worksheet.getRow(10 + index)
    row.getCell(2).value = site.orsId // B
    row.getCell(3).value = site.country // C
    row.getCell(4).value = site.name // D
    row.getCell(5).value = site.line1 // E
    row.getCell(6).value = site.line2 ?? null // F
    row.getCell(7).value = site.townOrCity // G
    row.getCell(8).value = site.stateOrRegion ?? null // H
    row.getCell(9).value = site.postcode ?? null // I
    row.getCell(10).value = site.coordinates ?? null // J
    row.getCell(11).value = site.validFrom ?? null // K
  })

  const filePath = path.join(resourcesDir, filename)
  await workbook.xlsx.writeFile(filePath)
  console.log(`Generated: ${filePath}`)
}

// Valid ORS spreadsheet with 3 sites
await createOrsSpreadsheet('ors-valid.xlsx', {
  metadata: {
    packagingWasteCategory: 'Paper or board',
    orgId: 500001,
    registrationNumber: 'R25SR500030912PA',
    accreditationNumber: 'ACC123456'
  },
  sites: [
    {
      orsId: 1,
      country: 'France',
      name: 'Papier Recyclage',
      line1: '12 Rue de la Paix',
      line2: 'Batiment B',
      townOrCity: 'Paris',
      stateOrRegion: 'Ile-de-France',
      postcode: '75002',
      coordinates: '48.8698,2.3311',
      validFrom: '2025-01-01'
    },
    {
      orsId: 2,
      country: 'Germany',
      name: 'Karton Verarbeiter',
      line1: '45 Berliner Strasse',
      townOrCity: 'Berlin',
      stateOrRegion: 'Berlin',
      postcode: '10115',
      coordinates: '52.5200,13.4050',
      validFrom: '2025-01-01'
    },
    {
      orsId: 3,
      country: 'Spain',
      name: 'Papel Reciclado',
      line1: '8 Calle Mayor',
      line2: 'Planta 2',
      townOrCity: 'Madrid',
      stateOrRegion: 'Madrid',
      postcode: '28013',
      coordinates: '40.4168,-3.7038',
      validFrom: '2025-01-01'
    }
  ]
})

// Invalid ORS spreadsheet - missing required fields
await createOrsSpreadsheet('ors-invalid.xlsx', {
  metadata: {
    packagingWasteCategory: 'Paper or board',
    orgId: 500001,
    registrationNumber: 'R25SR500030912PA',
    accreditationNumber: 'ACC123456'
  },
  sites: [
    {
      orsId: 1,
      country: 'France',
      name: 'Valid Site',
      line1: '12 Rue de la Paix',
      townOrCity: 'Paris'
    },
    {
      // Missing country and name (required fields)
      orsId: 2,
      country: null,
      name: null,
      line1: '45 Berliner Strasse',
      townOrCity: 'Berlin'
    },
    {
      // Missing address line 1 and town (required fields)
      orsId: 3,
      country: 'Spain',
      name: 'Missing Address Site',
      line1: null,
      townOrCity: null
    }
  ]
})

console.log('ORS spreadsheet generation complete.')
