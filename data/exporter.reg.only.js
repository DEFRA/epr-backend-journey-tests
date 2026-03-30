import { fakerEN_GB as faker } from '@faker-js/faker'
import BASEL_CODES from './basel-codes.js'
import {
  RECYCLABLE_PROPORTION_METHODS,
  YES_NO,
  ACTIVITIES,
  countryList
} from './shared-spreadsheet-values.js'

// Generate a single row for "Received" section
export function generateRegOnlyReceivedRow() {
  const date = faker.date.recent({ days: 20 })

  return {
    // Section 1
    G: `01/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`, // Column G: Date received for export
    H: faker.company.name(), // Column H: Supplier name
    I: faker.location.streetAddress(), // Column I: First line of supplier address
    J: faker.location.zipCode(), // Column J: Supplier postcode
    K: faker.internet.email(), // Column K: Supplier email
    L: faker.phone.number(), // Column L: Supplier phone number
    M: faker.helpers.arrayElement(ACTIVITIES), // Column M: Activities carried out by supplier on the packaging waste (For example, sorting)
    N: parseFloat(
      faker.number.float({ min: 20, max: 50, precision: 0.01 }).toFixed(2)
    ), // Column N: Net weight
    O: faker.helpers.arrayElement(RECYCLABLE_PROPORTION_METHODS), // Column O: How did you calculate the recyclable proportion?
    P: faker.number.float({ min: 0.05, max: 0.8 }) // Column P: Recyclable Percentage
  }
}

// Generate a single row for "Exported (sections 2 and 3)"
export function generateRegOnlyExportedRow() {
  const date = faker.date.recent({ days: 20 })
  const repatriatedDate = faker.date.recent({ days: 120 })
  const reprocessorCountry = faker.helpers.arrayElement(countryList)

  return {
    // Section 2
    G: parseFloat(
      faker.number.float({ min: 1, max: 5, precision: 0.01 }).toFixed(2)
    ), // Tonnage of UK packaging waste exported
    H: date.toLocaleDateString('en-GB'), // Date of export
    I: faker.number.int({ min: 100, max: 999 }), // Registered overseas reprocessor's ID
    J: faker.helpers.arrayElement(BASEL_CODES), // Basel export code
    K: faker.helpers.arrayElement(YES_NO), // Was the waste refused by the recipient destination?
    L: faker.helpers.arrayElement(YES_NO), // Was the waste stopped during the course of export?
    M: repatriatedDate.toLocaleDateString('en-GB'), // Date that the stopped or refused waste was repatriated

    // Section 3
    R: faker.company.name() + ' Limited', // Registered oveseas reprocessor's site name
    S: reprocessorCountry.name + '-' + reprocessorCountry.code, // Approved overseas reprocessor's country
    T: faker.number.int({ min: 3000000000, max: 4000000000 }), // customs code (HS code)
    U:
      faker.string.alpha({ count: 4, casing: 'upper' }) +
      faker.number.int({ min: 1000000, max: 10000000 }) // Container or trailer number / IMO vessel if bulk shipment
  }
}

// Generate a single row for "Sent on (section 4)"
export function generateRegOnlySentOnRow() {
  const date = faker.date.recent({ days: 20 })

  return {
    // Section 4
    G: date.toLocaleDateString('en-GB'), // Date load left site
    H: parseFloat(
      faker.number.float({ min: 5, max: 20, precision: 0.01 }).toFixed(2)
    ), // Tonnage of UK packaging waste sent on
    I: 'Exporter', // Final destination facility type
    J: faker.company.name(), // Final destination facility name
    K: faker.location.streetAddress(), // First line of final destination facility address
    L: faker.location.zipCode() // Final destination facility postcode
  }
}
