@smoketest
Feature: Summary Logs smoke test for Test environment

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

    When I submit the summary log upload completed with the response from CDP Uploader
    Then I should receive a summary log upload accepted response

    When I check for the summary log status
    Then I should see the following summary log response
      | status  | validated  |
    And I should see the following summary log validation concerns for table "RECEIVED_LOADS_FOR_REPROCESSING", row 6 and sheet "Received (sections 1, 2 and 3)"
      | Type  | Code           | Header   | Column |
      | error | FIELD_REQUIRED | EWC_CODE | H      |

    When I submit the uploaded summary log
    Then the summary log submission succeeds

  Scenario: Summary Logs uploads (Reprocessor Output) and succeeds
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

    When I submit the summary log upload completed with the response from CDP Uploader
    Then I should receive a summary log upload accepted response

    And the summary log submission status is 'validated'

    When I submit the uploaded summary log
    Then the summary log submission succeeds
    And the summary log submission status is 'submitted'

