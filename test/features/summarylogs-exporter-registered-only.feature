@summarylogs
@summarylogs_regonly_exporter
Feature: Summary Logs - Registered Only Exporter

  Background:
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType | withoutAccreditation |
      | Exporter            | true                 |

    Given I am logged in as a service maintainer
    When I update the recently migrated organisations data with the following data
      | regNumber        | status   | validFrom  | withoutAccreditation |
      | E25SR500030912PA | approved | 2025-02-02 | true                 |
    Then the organisations data update succeeds

    When I register and authorise a User and link it to the recently migrated organisation

  Scenario: Summary Logs uploads (Registered only) and creates a Waste Record
    Given I have the following summary log upload data for summary log upload
      | s3Bucket            | re-ex-summary-logs                |
      | s3Key               | exporter-regonly-valid-key         |
      | fileId              | exporter-regonly-valid-file-id     |
      | filename            | exporter-regonly-valid.xlsx        |
      | fileStatus          | complete                           |
      | registrationNumber  | E25SR500030912PA                   |
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response
    And the summary log submission status is 'validated'
    And the summary log has the following loads
      | LoadType       | Count | RowIDs                                                                              |
      | added.valid    | 15    | 1000,1001,1002,1003,1004,2000,2001,2002,2003,2004,4000,4001,4002,4003,4004         |
      | added.invalid  | 0     |                                                                                     |
      | added.included | 0     |                                                                                     |
      | added.excluded | 0     |                                                                                     |
    And the summary log loadsByWasteRecordType contains the following waste record types
      | WasteRecordType | SheetName                  |
      | received        | Received (section 1)       |
      | exported        | Exported (sections 2 and 3) |
      | sentOn          | Sent on (section 4)        |
    When I submit the uploaded summary log
    Then the summary log submission succeeds
    And the summary log submission status is 'submitted'

  Scenario: Summary Logs uploads (Exporter, Registered Only) and fails in-sheet revalidation
    Given I have the following summary log upload data for summary log upload
      | s3Bucket   | re-ex-summary-logs                  |
      | s3Key      | exporter-regonly-invalid-key         |
      | fileId     | exporter-regonly-invalid-file-id     |
      | filename   | exporter-regonly-invalid.xlsx        |
      | fileStatus | complete                             |
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response

    When I check for the summary log status
    Then I should see the following summary log response
      | status | invalid |
    And I should see the following summary log validation failures
      | Code               | Location Sheet       | Location Table             | Location Row | Location Header                             | Actual     |
      | VALUE_OUT_OF_RANGE | Received (section 1) | RECEIVED_LOADS_FOR_EXPORT  | 4            | RECYCLABLE_PROPORTION_PERCENTAGE            | 1.22       |
      | VALUE_OUT_OF_RANGE | Received (section 1) | RECEIVED_LOADS_FOR_EXPORT  | 4            | NET_WEIGHT                                  | -1         |
      | VALUE_OUT_OF_RANGE | Received (section 1) | RECEIVED_LOADS_FOR_EXPORT  | 4            | TONNAGE_RECEIVED_FOR_EXPORT                 | -18.5      |
      | INVALID_TYPE       | Received (section 1) | RECEIVED_LOADS_FOR_EXPORT  | 4            | HOW_DID_YOU_CALCULATE_RECYCLABLE_PROPORTION | invalid    |
      | INVALID_FORMAT     | Received (section 1) | RECEIVED_LOADS_FOR_EXPORT  | 4            | MONTH_RECEIVED_FOR_EXPORT                   | 30-06-2025 |
    When I submit the uploaded summary log
    Then I should receive a 409 error response 'Summary log must be validated before submission. Current status: invalid'
