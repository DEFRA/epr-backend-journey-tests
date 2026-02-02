import { fakerEN_GB as faker } from '@faker-js/faker'
import EWC_CODES from './ewc-codes.js'
import {
  RECYCLABLE_PROPORTION_METHODS,
  YES_NO,
  ACTIVITIES
} from './shared-spreadsheet-values.js'

// Generate a single row for "Received" sections
export function generateReceivedRow(material) {
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
export function generateOutputReprocessedRow() {
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

export function generateOutputSentOnRow(material) {
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
