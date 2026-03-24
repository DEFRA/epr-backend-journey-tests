@summarylogs
@summarylogs_regonly_reprocessor
Feature: Summary Logs - Registered Only Reprocessor

  Background:
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType | withoutAccreditation |
      | Reprocessor         | true                 |

    Given I am logged in as a service maintainer
    When I update the recently migrated organisations data with the following data
      | reprocessingType | regNumber        | status   | validFrom  | withoutAccreditation |
      | input            | R25SR500030912PA | approved | 2025-02-02 | true                 |
    Then the organisations data update succeeds

    When I register and authorise a User and link it to the recently migrated organisation

  Scenario: Summary Logs uploads (Registered only) and creates a Waste Record
    Given I have the following summary log upload data for summary log upload
      | s3Bucket            | re-ex-summary-logs                |
      | s3Key               | reprocessor-regonly-valid-key     |
      | fileId              | reprocessor-regonly-valid-file-id |
      | filename            | reprocessor-regonly-valid.xlsx    |
      | fileStatus          | complete                          |
      | registrationNumber  | R25SR500030912PA                  |
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response
    And the summary log submission status is 'validated'
    And the summary log has the following loads
      | LoadType       | Count | RowIDs                                            |
      | added.valid    | 10    | 1000,1001,1002,1003,1004,5000,5001,5002,5003,5004 |
      | added.invalid  | 0     |                                                   |
      | added.included | 0     |                                                   |
      | added.excluded | 0     |                                                   |
    When I submit the uploaded summary log
    Then the summary log submission succeeds
    And the summary log submission status is 'submitted'
    When I retrieve the 'quarterly' report for the year 2026 and period 1
    Then the report is successfully retrieved
    And the report contains the following information
      | Key                                 | Value                       |
      | operatorCategory                    | REPROCESSOR_REGISTERED_ONLY |
      | cadence                             | quarterly                   |
      | sections.wasteReceived.totalTonnage | 69.34                       |
      | sections.wasteSentOn.totalTonnage   | 49.51                       |
      | details.material                    | paper                       |


  Scenario: Summary Logs uploads (Reprocessor, Registered Only) and fails in-sheet revalidation
    Given I have the following summary log upload data for summary log upload
      | s3Bucket   | re-ex-summary-logs                  |
      | s3Key      | reprocessor-regonly-invalid-key     |
      | fileId     | reprocessor-regonly-invalid-file-id |
      | filename   | reprocessor-regonly-invalid.xlsx    |
      | fileStatus | complete                            |
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response

    When I check for the summary log status
    Then I should see the following summary log response
      | status | invalid |
    And I should see the following summary log validation failures
      | Code               | Location Sheet       | Location Table                  | Location Row | Location Header                             | Actual     |
      | VALUE_OUT_OF_RANGE | Received (section 1) | RECEIVED_LOADS_FOR_REPROCESSING | 4            | RECYCLABLE_PROPORTION_PERCENTAGE            | 1.22       |
      | VALUE_OUT_OF_RANGE | Received (section 1) | RECEIVED_LOADS_FOR_REPROCESSING | 4            | NET_WEIGHT                                  | -1         |
      | VALUE_OUT_OF_RANGE | Received (section 1) | RECEIVED_LOADS_FOR_REPROCESSING | 4            | TONNAGE_RECEIVED_FOR_RECYCLING              | -18.5      |
      | INVALID_TYPE       | Received (section 1) | RECEIVED_LOADS_FOR_REPROCESSING | 4            | HOW_DID_YOU_CALCULATE_RECYCLABLE_PROPORTION | invalid    |
      | INVALID_FORMAT     | Received (section 1) | RECEIVED_LOADS_FOR_REPROCESSING | 4            | MONTH_RECEIVED_FOR_REPROCESSING             | 30-06-2025 |
    When I submit the uploaded summary log
    Then I should receive a 409 error response 'Summary log must be validated before submission. Current status: invalid'
