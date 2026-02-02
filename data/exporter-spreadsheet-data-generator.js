import { fakerEN_GB as faker } from '@faker-js/faker'
import EWC_CODES from './ewc-codes.js'
import BASEL_CODES from './basel-codes.js'
import {
  RECYCLABLE_PROPORTION_METHODS,
  YES_NO,
  ACTIVITIES,
  EXPORT_CONTROLS,
  countryList
} from './shared-spreadsheet-values.js'

// Generate a single row for "Exported" sections
export function generateExportedRow(material) {
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

// Generate a single row for "Sent On" sections
export function generateSentOnRow(material) {
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
