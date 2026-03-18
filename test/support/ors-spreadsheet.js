import ExcelJS from 'exceljs'

export const validOrsSites = [
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

export const validOrsSitesBatch2 = [
  {
    orsId: 4,
    country: 'Italy',
    name: 'Carta Riciclata',
    line1: '22 Via Roma',
    townOrCity: 'Rome',
    stateOrRegion: 'Lazio',
    postcode: '00184',
    coordinates: '41.9028,12.4964',
    validFrom: '2025-01-01'
  },
  {
    orsId: 5,
    country: 'Netherlands',
    name: 'Papier Hergebruik',
    line1: '10 Damrak',
    townOrCity: 'Amsterdam',
    stateOrRegion: 'North Holland',
    postcode: '1012 LG',
    coordinates: '52.3676,4.9041',
    validFrom: '2025-01-01'
  }
]

export const invalidOrsSites = [
  {
    orsId: 1,
    country: 'France',
    name: 'Valid Site',
    line1: '12 Rue de la Paix',
    townOrCity: 'Paris'
  },
  {
    orsId: 2,
    country: null,
    name: null,
    line1: '45 Berliner Strasse',
    townOrCity: 'Berlin'
  },
  {
    orsId: 3,
    country: 'Spain',
    name: 'Missing Address Site',
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
