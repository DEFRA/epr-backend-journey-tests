import ExcelJS from 'exceljs'

export const validOrsSites = [
  {
    orsId: 1,
    country: 'France',
    name: 'Test Site Alpha',
    line1: '1 Test Street',
    line2: 'Unit 99',
    townOrCity: 'Testville',
    stateOrRegion: 'Test-Region-FR',
    postcode: 'TEST-FR-001',
    coordinates: '0.0000,0.0000',
    validFrom: '2025-01-01'
  },
  {
    orsId: 2,
    country: 'Germany',
    name: 'Test Site Beta',
    line1: '2 Test Street',
    townOrCity: 'Teststadt',
    stateOrRegion: 'Test-Region-DE',
    postcode: 'TEST-DE-001',
    coordinates: '0.0000,0.0000',
    validFrom: '2025-01-01'
  },
  {
    orsId: 3,
    country: 'Spain',
    name: 'Test Site Gamma',
    line1: '3 Test Street',
    line2: 'Floor 0',
    townOrCity: 'Testciudad',
    stateOrRegion: 'Test-Region-ES',
    postcode: 'TEST-ES-001',
    coordinates: '0.0000,0.0000',
    validFrom: '2025-01-01'
  }
]

export const validOrsSitesReg2 = [
  {
    orsId: 1,
    country: 'Italy',
    name: 'Test Site Delta',
    line1: '4 Test Street',
    townOrCity: 'Testcitt\u00e0',
    stateOrRegion: 'Test-Region-IT',
    postcode: 'TEST-IT-001',
    coordinates: '0.0000,0.0000',
    validFrom: '2025-01-01'
  },
  {
    orsId: 2,
    country: 'Netherlands',
    name: 'Test Site Epsilon',
    line1: '5 Test Street',
    townOrCity: 'Testdorp',
    stateOrRegion: 'Test-Region-NL',
    postcode: 'TEST-NL-001',
    coordinates: '0.0000,0.0000',
    validFrom: '2025-01-01'
  }
]

export const invalidOrsSites = [
  {
    orsId: 1,
    country: 'France',
    name: 'Test Valid Site',
    line1: '1 Test Street',
    townOrCity: 'Testville'
  },
  {
    orsId: 2,
    country: null,
    name: null,
    line1: '2 Test Street',
    townOrCity: 'Teststadt'
  },
  {
    orsId: 3,
    country: 'Spain',
    name: 'Test Missing Address Site',
    line1: null,
    townOrCity: null
  }
]

/**
 * Creates an ORS spreadsheet with the required structure:
 * - Sheet name: "ORS ID Log"
 * - Row 4, Col D: Packaging waste category
 * - Row 5, Col D: Org ID
 * - Row 6, Col D: Registration number
 * - Row 7, Col D: Accreditation number
 * - Data rows from row 10, columns B-K
 */
export const createOrsSpreadsheet = async (filePath, { metadata, sites }) => {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('ORS ID Log')

  worksheet.getRow(4).getCell(3).value = 'Packaging waste category'
  worksheet.getRow(5).getCell(3).value = 'Organisation ID'
  worksheet.getRow(6).getCell(3).value = 'Registration number'
  worksheet.getRow(7).getCell(3).value = 'Accreditation number'

  worksheet.getRow(4).getCell(4).value = metadata.packagingWasteCategory
  worksheet.getRow(5).getCell(4).value = metadata.orgId
  worksheet.getRow(6).getCell(4).value = metadata.registrationNumber
  worksheet.getRow(7).getCell(4).value = metadata.accreditationNumber

  const headers = [
    '',
    'ORS ID',
    'Country',
    'Name',
    'Address Line 1',
    'Address Line 2',
    'Town/City',
    'State/Region',
    'Postcode',
    'Coordinates',
    'Valid From'
  ]
  const headerRow = worksheet.getRow(9)
  headers.forEach((header, index) => {
    headerRow.getCell(index + 1).value = header
  })

  sites.forEach((site, index) => {
    const row = worksheet.getRow(10 + index)
    row.getCell(2).value = site.orsId
    row.getCell(3).value = site.country
    row.getCell(4).value = site.name
    row.getCell(5).value = site.line1
    row.getCell(6).value = site.line2 ?? null
    row.getCell(7).value = site.townOrCity
    row.getCell(8).value = site.stateOrRegion ?? null
    row.getCell(9).value = site.postcode ?? null
    row.getCell(10).value = site.coordinates ?? null
    row.getCell(11).value = site.validFrom ?? null
  })

  await workbook.xlsx.writeFile(filePath)
}
