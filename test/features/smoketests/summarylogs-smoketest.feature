@smoketest
Feature: Summary Logs smoke test

  Scenario: Summary Logs For Reprocessor Input uploads (With validation concerns) and succeeds
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType |
      | Reprocessor         |

    Given I am logged in as a service maintainer
    When I update the recently migrated organisations data with the following data
      | reprocessingType | regNumber        | accNumber | status   |
      | input            | R25SR500030912PA | ACC123456 | approved |
    Then the organisations data update succeeds

    When I register and authorise a User and link it to the recently migrated organisation

    Given I have organisation and registration details for summary log upload
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds

    When I upload the file 'reprocessor-input-valid.xlsx' via the CDP uploader
    Then the upload to CDP uploader succeeds

    When I check for the summary log status
    Then I should see the following summary log response
      | status  | validated  |
    And I should see the following summary log validation concerns for table "RECEIVED_LOADS_FOR_REPROCESSING", row 6 and sheet "Received (sections 1, 2 and 3)"
      | Type  | Code           | Header   | Column |
      | error | FIELD_REQUIRED | EWC_CODE | H      |

    When I submit the uploaded summary log
    Then the summary log submission succeeds
    And the summary log submission status is 'submitted'

    When I retrieve the waste balance for the organisation
    Then I should see the following waste balance
      | AccreditationId     | Amount | AvailableAmount |
      | {{summaryLogAccId}} | 361.62 | 361.62          |

  Scenario: Summary Logs upload (Reprocessor Output) and succeeds
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType | material   |
      | Reprocessor         | Steel (R4) |

    Given I am logged in as a service maintainer
    When I update the recently migrated organisations data with the following data
      | reprocessingType | regNumber        | accNumber | status   |
      | output           | R25SR500050912PA | ACC500591 | approved |
    Then the organisations data update succeeds

    When I register and authorise a User and link it to the recently migrated organisation

    Given I have organisation and registration details for summary log upload
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds

    When I upload the file 'reprocessor-output-valid.xlsx' via the CDP uploader
    Then the upload to CDP uploader succeeds

    And the summary log submission status is 'validated'

    When I submit the uploaded summary log
    Then the summary log submission succeeds
    And the summary log submission status is 'submitted'

    When I retrieve the waste balance for the organisation
    Then I should see the following waste balance
      | AccreditationId     | Amount | AvailableAmount |
      | {{summaryLogAccId}} | 3      | 3               |


  Scenario: Summary Logs upload (Exporter) and succeeds
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType |
      | Exporter            |

    Given I am logged in as a service maintainer
    When I update the recently migrated organisations data with the following data
      | regNumber        | accNumber | status   |
      | E25SR500030913PA | ACC234567 | approved |
    Then the organisations data update succeeds

    When I register and authorise a User and link it to the recently migrated organisation

    When I generate the ORS test spreadsheet with the following data
      | orsId | country | name                     | line1             | line2      | townOrCity | stateOrRegion | postcode | coordinates     | validFrom  |
      | 124   | France  | Papier Recyclage         | 12 Rue de la Paix | Batiment B | Paris      | Ile-de-France | 75002    | 48.8698,2.3311  | 2025-01-01 |
      | 099   | Norway  | Nordic Paper Recovery One | 11 Fjord Lane     | Unit 1     | Oslo       | Oslo          | 0150     | 59.9139,10.7522 | 2025-01-01 |
      | 512   | Germany | German Recycling GmbH    | 45 Industriestr   |            | Berlin     | Berlin        | 10115    | 52.5200,13.4050 | 2025-01-01 |

    When I initiate an ORS import
    Then the ORS import initiation succeeds

    When I upload ORS file 'ors-valid.xlsx' via the CDP uploader
    Then the upload to CDP uploader succeeds

    When I check the ORS import status
    Then the ORS import status should be 'completed'

    Given I have organisation and registration details for summary log upload
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds

    When I upload the file 'exporter.xlsx' via the CDP uploader
    Then the upload to CDP uploader succeeds

    And the summary log submission status is 'validated'

    When I submit the uploaded summary log
    Then the summary log submission succeeds
    And the summary log submission status is 'submitted'

    When I retrieve the waste balance for the organisation
    Then I should see the following waste balance
      | AccreditationId     | Amount | AvailableAmount |
      | {{summaryLogAccId}} | 30      | 30             |

  Scenario: Access denied when user tries to access a different organisation and initiating summary log upload without a redirectUrl
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType |
      | Reprocessor         |

    Given I am logged in as a service maintainer
    When I update the recently migrated organisations data with the following data
      | reprocessingType | regNumber        | accNumber | status   |
      | input            | R25SR500030912PA | ACC123456 | approved |
    Then the organisations data update succeeds

    When I register and authorise a User and link it to the recently migrated organisation

    Given I have organisation and registration details for summary log upload
    When I try to access summary logs for organisation '6507f1f77bcf86cd79943999'
    Then I should receive a 401 error response 'Access denied: organisation mismatch'

    When I initiate the summary log upload without redirectUrl
    Then I should receive a 422 error response '"redirectUrl" is required'
