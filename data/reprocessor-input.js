import { fakerEN_GB as faker } from '@faker-js/faker'
import EWC_CODES from './ewc-codes.js'
import {
  RECYCLABLE_PROPORTION_METHODS,
  YES_NO,
  ACTIVITIES
} from './shared-spreadsheet-values.js'

// Generate a single row for "Received" sections
export function generateInputReceivedRow(material) {
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
    O: faker.helpers.arrayElement(YES_NO), // Column O: Pallet weight
    P: faker.helpers.arrayElement(RECYCLABLE_PROPORTION_METHODS), // Column P
    Q: faker.number.float({ min: 5, max: 10, precision: 0.01 }), // Column Q
    R: faker.number.float({ min: 0.05, max: 0.8 }), // Column R

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
export function generateInputReprocessedRow() {
  const date = faker.date.recent({ days: 20 })

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

// Generate a single row for "Sent On" sections
export function generateInputSentOnRow(material) {
  const date = faker.date.recent({ days: 20 })

  return {
    // Section 5
    G: date.toLocaleDateString('en-US'), // Date load left site
    H: faker.number.float({ min: 5, max: 20, precision: 0.01 }), // Tonnage of UK packaging waste sent on

    // Section 6
    M: 'Reprocessor', // Final destination facility type
    N: faker.company.name(), // Final destination facility name
    O: faker.location.streetAddress(), // First line of final destination facility address
    P: faker.location.zipCode(), // Final destination facility postcode

    // Section 7
    U: faker.internet.email(), // Final destination facility email
    V: faker.phone.number(), // Final destination facility phone number
    W: `W${faker.number.int({ min: 100000, max: 999999 })}`, // Your reference
    X: faker.helpers.arrayElement(material.wasteDescriptions), // Description of waste sent on
    Y: faker.helpers.arrayElement(EWC_CODES), // EWC code
    Z: `WB-${faker.number.int({ min: 10000, max: 999999 })}` // Weighbridge ticket number or scales reference
  }
}
