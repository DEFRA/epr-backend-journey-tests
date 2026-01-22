@glassMaterial
Feature: Glass material schema validation

  Scenario: Glass Recycling should not accept any value other than defined in schema
    Given I create a linked and migrated organisation for the following
    | wasteProcessingType | material   |
    | Reprocessor         | Glass (R5) |
    Given I am logged in as a service maintainer
    And I have access to the get organisations endpoint
    When I request the recently migrated organisation
    Then I should receive a valid organisations response for the recently migrated organisation

    When I update the recently migrated organisations data with the following data
    | reprocessingType | regNumber        | accNumber | status   | glassRecyclingProcess |
    | input            | R25SR500030912PA | ACC123456 | approved | glass_re_melt         |
    Then the organisations data update succeeds

    When I update the recently migrated organisations data with the following data
    | reprocessingType | regNumber        | accNumber | status   | glassRecyclingProcess |
    | input            | R25SR500030912PA | ACC123456 | approved | glass_other           |
    Then the organisations data update succeeds

    When I update the recently migrated organisations data with the following data
    | reprocessingType | regNumber        | accNumber | status   | glassRecyclingProcess      |
    | input            | R25SR500030912PA | ACC123456 | approved | glass_other, glass_re_melt |
    Then the organisations data update succeeds

    When I update the recently migrated organisations data with the following data
    | reprocessingType | regNumber        | accNumber | status   | glassRecyclingProcess |
    | input            | R25SR500030912PA | ACC123456 | approved | glass_invalid         |
    Then the organisations data update fails

  Scenario Outline: Glass Recycling should not be relevant to other material apart from Glass
    Given I create a linked and migrated organisation for the following
    | wasteProcessingType   | material   |
    | <WasteProcessingType> | <Material> |
    Given I am logged in as a service maintainer
    And I have access to the get organisations endpoint
    When I request the recently migrated organisation
    Then I should receive a valid organisations response for the recently migrated organisation

    When I update the recently migrated organisations data with the following data
    | reprocessingType   | regNumber        | accNumber | status   | glassRecyclingProcess |
    | <ReprocessingType> | R25SR500030912PA | ACC123456 | approved | glass_re_melt         |
    Then the organisations data update fails

    Examples:
      | WasteProcessingType | ReprocessingType | Material                            |
      | Exporter            |                  | Aluminium (R4)                      |
      | Exporter            |                  | Fibre-based composite material (R3) |
      | Reprocessor         | input            | Paper or board (R3)                 |
      | Reprocessor         | output           | Plastic (R3)                        |
      | Reprocessor         | input            | Steel (R4)                          |
      | Reprocessor         | output           | Wood (R3)                           |
