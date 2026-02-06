@glassMaterial
Feature: Glass material schema validation

  Scenario: Glass Recycling should not accept any value other than defined in schema
    Given I create a linked and migrated organisation for the following
    | wasteProcessingType | material   | glassRecyclingProcess |
    | Reprocessor         | Glass (R5) | Glass other           |
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
    | reprocessingType | regNumber        | accNumber | status   | glassRecyclingProcess |
    | input            | R25SR500030912PA | ACC123456 | approved | glass_invalid         |
    Then the organisations data update fails

  Scenario Outline: Glass Recycling Process should not be relevant to other material apart from Glass
    Given I create a linked and migrated organisation for the following
    | wasteProcessingType   | material   |
    | <WasteProcessingType> | <Material> |
    Given I am logged in as a service maintainer
    And I have access to the get organisations endpoint
    When I request the recently migrated organisation
    Then I should receive a valid organisations response for the recently migrated organisation

    When I update the recently migrated organisations data with the following data
    | reprocessingType   | regNumber        | accNumber | status   | glassRecyclingProcess   |
    | <ReprocessingType> | R25SR500030912PA | ACC123456 | approved | <GlassRecyclingProcess> |
    Then the organisations data update fails

    Examples:
      | WasteProcessingType | ReprocessingType | Material                            | GlassRecyclingProcess |
      | Exporter            |                  | Aluminium (R4)                      | glass_re_melt         |
      | Exporter            |                  | Fibre-based composite material (R3) | glass_other           |
      | Reprocessor         | input            | Paper or board (R3)                 | glass_other           |
      | Reprocessor         | output           | Plastic (R3)                        | glass_re_melt         |
      | Reprocessor         | input            | Steel (R4)                          | glass_other           |
      | Reprocessor         | output           | Wood (R3)                           | glass_other           |

  Scenario: Glass Recycling should not allow Glass Remelt Summary Logs upload if organisation is for Glass Other
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType | material   | glassRecyclingProcess |
      | Reprocessor         | Glass (R5) | Glass other           |

    Given I am logged in as a service maintainer
    When I update the recently migrated organisations data with the following data
      | reprocessingType | regNumber        | accNumber | status   | glassRecyclingProcess |
      | input            | R25SR500030912GR | ACC567890 | approved | glass_other           |
    Then the organisations data update succeeds

    When I register and authorise a User and link it to the recently migrated organisation

    Given I have the following summary log upload data for summary log upload
      | s3Bucket   | re-ex-summary-logs         |
      | s3Key      | glass-remelt-input-key     |
      | fileId     | glass-remelt-input-file-id |
      | filename   | glass-remelt-input.xlsx    |
      | fileStatus | complete                   |
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response

    When I check for the summary log status
    Then I should see the following summary log response
      | status | invalid |

    And I should see the following summary log validation failures
      | Code              | Location Sheet | Location Row | Actual      |
      | MATERIAL_MISMATCH | Cover          | 7            | glass_other |

  Scenario: Glass Recycling should not allow Glass Other Summary Logs upload if organisation is for Glass Remelt
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType | material   | glassRecyclingProcess |
      | Reprocessor         | Glass (R5) | Glass re-melt         |

    Given I am logged in as a service maintainer
    When I update the recently migrated organisations data with the following data
      | reprocessingType | regNumber        | accNumber  | status   | glassRecyclingProcess |
      | output           | R25SR500050912GO | ACC5066791 | approved | glass_re_melt         |
    Then the organisations data update succeeds

    When I register and authorise a User and link it to the recently migrated organisation

    Given I have the following summary log upload data for summary log upload
      | s3Bucket   | re-ex-summary-logs         |
      | s3Key      | glass-other-output-key     |
      | fileId     | glass-other-output-file-id |
      | filename   | glass-other-output.xlsx    |
      | fileStatus | complete                   |
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response

    When I check for the summary log status
    Then I should see the following summary log response
      | status | invalid |

    And I should see the following summary log validation failures
      | Code              | Location Sheet | Location Row | Actual        |
      | MATERIAL_MISMATCH | Cover          | 7            | glass_re_melt |

  Scenario: Glass Recycling should allow Glass Remelt Summary Logs upload if organisation is for Glass Remelt
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType | material   | glassRecyclingProcess |
      | Reprocessor         | Glass (R5) | Glass re-melt         |

    Given I am logged in as a service maintainer
    When I update the recently migrated organisations data with the following data
      | reprocessingType | regNumber        | accNumber | status   | glassRecyclingProcess |
      | input            | R25SR500030912GR | ACC567890 | approved | glass_re_melt         |
    Then the organisations data update succeeds

    When I register and authorise a User and link it to the recently migrated organisation

    Given I have the following summary log upload data for summary log upload
      | s3Bucket   | re-ex-summary-logs         |
      | s3Key      | glass-remelt-input-key     |
      | fileId     | glass-remelt-input-file-id |
      | filename   | glass-remelt-input.xlsx    |
      | fileStatus | complete                   |
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response

    When I check for the summary log status
    Then I should see the following summary log response
      | status | validated |

  Scenario: Glass Recycling should allow Glass Other Summary Logs upload if organisation is for Glass Other
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType | material   | glassRecyclingProcess |
      | Reprocessor         | Glass (R5) | Glass other           |

    Given I am logged in as a service maintainer
    When I update the recently migrated organisations data with the following data
      | reprocessingType | regNumber        | accNumber  | status   | glassRecyclingProcess |
      | output           | R25SR500050912GO | ACC5066791 | approved | glass_other           |
    Then the organisations data update succeeds

    When I register and authorise a User and link it to the recently migrated organisation

    Given I have the following summary log upload data for summary log upload
      | s3Bucket   | re-ex-summary-logs         |
      | s3Key      | glass-other-output-key     |
      | fileId     | glass-other-output-file-id |
      | filename   | glass-other-output.xlsx    |
      | fileStatus | complete                   |
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response

    When I check for the summary log status
    Then I should see the following summary log response
      | status | validated |

  Scenario: Glass migration should split Glass (Both) into Glass Remelt and Glass Other
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType | material   | glassRecyclingProcess |
      | Reprocessor         | Glass (R5) | Both                  |
    Given I am logged in as a service maintainer
    And I have access to the get organisations endpoint
    When I request the recently migrated organisation
    Then I should receive a valid organisations response for the recently migrated organisation
    And I should see 2 registrations and 2 accreditations in the organisations response
    And I should see the following glass information in the organisations response
      | glassRecyclingProcess |
      | glass_re_melt         |
      | glass_other           |
