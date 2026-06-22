@organisation_accreditation
Feature: Ensuring that accreditationId is only valid for one registration in an organisation

  Scenario: Glass based reprocessor should not be able to mismatch the accreditationIds to its registration
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType | material   | glassRecyclingProcess |
      | Reprocessor         | Glass (R5) | Glass other           |
      | Reprocessor         | Glass (R5) | Glass re-melt         |

    Given I am logged in as a service maintainer
    When I update the recently migrated organisations data with the following data
      | reprocessingType | regNumber        | accNumber | status   |
      | input            | R25SR500030912PA | ACC123456 | approved |
      | input            | R25SR500040912PA | ACC123456 | approved |
    Then the organisations data update succeeds

    When I update the recently migrated organisations registration data to point to the same accreditationId
    Then the organisations data update fails
    And I should receive a 422 error response which contains the message 'Each accreditation must be linked to at most one registration:'

    When I update the recently migrated organisations first registration data to point to accreditationId 'invalid'
    Then the organisations data update fails
    And I should receive a 422 error response 'Invalid organisation data: registrations.0.accreditationId: id must be a valid MongoDB ObjectId'

    When I update the recently migrated organisations first registration data to point to accreditationId '123456789012345678901234'
    Then the organisations data update fails
    And I should receive a 422 error response which contains the message 'Registrations are linked to accreditations that do not exist'

    # Swap accreditationIds between Glass Re-melt and Other, not allowed
    When I update the recently migrated organisations first two registration data and swap the accreditationIds
    Then the organisations data update fails
    And I should receive a 422 error response which contains the message 'Registrations are linked to accreditations that do not match their type, material, or site:'

  Scenario: Swap accreditationIds between different materials, not allowed
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType | material            |
      | Reprocessor         | Paper or board (R3) |
      | Exporter            | Steel (R4)          |

    Given I am logged in as a service maintainer
    When I update the recently migrated organisations data with the following data
      | reprocessingType | regNumber        | accNumber | status   |
      | input            | R25SR500030912PA | ACC123456 | approved |
      |                  | E25SR500040912PA | ACC123456 | approved |
    Then the organisations data update succeeds

    When I update the recently migrated organisations first two registration data and swap the accreditationIds
    Then the organisations data update fails
    And I should receive a 422 error response which contains the message 'Registrations are linked to accreditations that do not match their type, material, or site:'
