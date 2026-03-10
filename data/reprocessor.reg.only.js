import { fakerEN_GB as faker } from '@faker-js/faker'
import {
  RECYCLABLE_PROPORTION_METHODS,
  ACTIVITIES
} from './shared-spreadsheet-values.js'

// Generate a single row for "Received" sections
export function generateRegOnlyReprocessorReceivedRow() {
  const date = faker.date.recent({ days: 20 })

  return {
    // Section 1
    G: `01/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`, // Month received
    H: faker.number.float({ min: 20, max: 50, precision: 0.01 }), // Net weight
    I: faker.helpers.arrayElement(RECYCLABLE_PROPORTION_METHODS), // How did you calculate the recyclable proportion?
    J: faker.number.float({ min: 0.05, max: 0.8 }), // Recyclable Proportion (Percentage)
    L: faker.company.name(), // Supplier name
    M: faker.location.streetAddress(), // First line of supplier address
    N: faker.location.zipCode(), // Supplier postcode
    O: faker.internet.email(), // Supplier email
    P: faker.phone.number(), // Supplier phone number
    Q: faker.helpers.arrayElement(ACTIVITIES) // Activities carried out by supplier on the packaging waste (For example, sorting)
  }
}

export function generateRegOnlyReprocessorSentOnRow() {
  const date = faker.date.recent({ days: 20 })

  return {
    // Section 2
    G: date.toLocaleDateString('en-GB'), // Date load left site
    H: faker.number.float({ min: 5, max: 20, precision: 0.01 }), // Tonnage of UK packaging waste sent on
    I: 'Reprocessor', // Final destination facility type
    J: faker.company.name(), // Final destination facility name
    K: faker.location.streetAddress(), // First line of final destination facility address
    L: faker.location.zipCode() // Final destination facility postcode
  }
}
