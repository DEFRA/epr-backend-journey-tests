@summarylogs
@summarylogs_input
Feature: Summary Logs - Reprocessor on Input

  Background:
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType |
      | Reprocessor         |

    Given I am logged in as a service maintainer
    When I update the recently migrated organisations data with the following data
      | reprocessingType | regNumber        | accNumber | status   |
      | input            | R25SR500030912PA | ACC123456 | approved |
    Then the organisations data update succeeds

    When I register and authorise a User and link it to the recently migrated organisation

  Scenario: Summary Logs uploads (With Validation concerns) and creates a Waste Record
    Given I have organisation and registration details for summary log upload
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds

    When I upload the file 'reprocessor-input-valid.xlsx' via the CDP uploader
    Then the upload to CDP uploader succeeds

    When I submit the summary log upload completed with the response from CDP Uploader
    Then I should receive a summary log upload accepted response
    And the following messages appear in the log
      | Log Level | Event Action    | Message                                                                                                                                                                                                         |
      | info      | request_success | File upload completed: summaryLogId={{summaryLogId}}, fileId={{summaryLogFileId}}, filename={{summaryLogFilename}}, status={{summaryLogFileStatus}}, s3Bucket={{summaryLogS3Bucket}}, s3Key={{summaryLogS3Key}} |
      | info      | start_success   | Summary log validation started: summaryLogId={{summaryLogId}}, fileId={{summaryLogFileId}}, filename={{summaryLogFilename}}                                                                                     |
      | info      | process_success | Extracted summary log file: summaryLogId={{summaryLogId}}, fileId={{summaryLogFileId}}, filename={{summaryLogFilename}}                                                                                         |
      | info      | process_success | Summary log updated: summaryLogId={{summaryLogId}}, fileId={{summaryLogFileId}}, filename={{summaryLogFilename}}, status=validated                                                                              |
    And the summary log is created in the database successfully

    When I check for the summary log status
    Then I should see the following summary log response
      | status  | validated  |
    And I should see the following summary log validation concerns for table "RECEIVED_LOADS_FOR_REPROCESSING", row 6 and sheet "Received (sections 1, 2 and 3)"
      | Type  | Code           | Header   | Column |
      | error | FIELD_REQUIRED | EWC_CODE | H      |

    When I submit the uploaded summary log and initiate a new upload at the same time
    Then the summary log submission succeeds
    And the new upload attempt succeeds
    And the following messages appear in the log
      | Log Level | Message                                              |
      | info      | Summary log submitted: summaryLogId={{summaryLogId}} |
    And the following audit logs are present
      | Event Category  | Event Action | Context Keys                                 | Count | Context Values                                           |
      | waste-reporting | submit       | summaryLogId, organisationId, registrationId | 1     | {{summaryLogId}},{{summaryLogOrgId}},{{summaryLogRegId}} |
    And I should see that waste records are created in the database with the following values
      | OrganisationId      | RegistrationId      | RowId | Type      |
      | {{summaryLogOrgId}} | {{summaryLogRegId}} | 1000  | received  |
      | {{summaryLogOrgId}} | {{summaryLogRegId}} | 1001  | received  |
      | {{summaryLogOrgId}} | {{summaryLogRegId}} | 1002  | received  |
      | {{summaryLogOrgId}} | {{summaryLogRegId}} | 4000  | processed |
      | {{summaryLogOrgId}} | {{summaryLogRegId}} | 5000  | sentOn    |
    And the submitted summary log should not have an expiry
    And I should see that waste balances are created in the database with the following values
      | OrganisationId      | AccreditationId     | Amount | AvailableAmount |
      | {{summaryLogOrgId}} | {{summaryLogAccId}} | 361.62 | 361.62          |

    # Summary Logs uploads and fails validation for removed row on second upload. This depends on the previous steps being executed
    Given I have the following summary log upload data for summary log upload
      | s3Bucket   | re-ex-summary-logs                |
      | s3Key      | valid-summary-log-input-2-key     |
      | fileId     | valid-summary-log-input-2-file-id |
      | filename   | valid-summary-log-input-2.xlsx    |
      | fileStatus | complete                          |
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response
    When I check for the summary log status
    Then I should see the following summary log response
      | status | invalid |
    And I should see the following summary log validation failures
      | Code                   | Location Sheet | Location Table                  | Location Row ID |
      | SEQUENTIAL_ROW_REMOVED | Received       | RECEIVED_LOADS_FOR_REPROCESSING | 1001            |
      | SEQUENTIAL_ROW_REMOVED | Received       | RECEIVED_LOADS_FOR_REPROCESSING | 1002            |
      | SEQUENTIAL_ROW_REMOVED | Processed      | PROCESSED_LOADS                 | 4000            |
      | SEQUENTIAL_ROW_REMOVED | Sent on        | SENT_ON_LOADS                   | 5000            |

    When I submit the uploaded summary log
    Then I should receive a 409 error response 'Summary log must be validated before submission. Current status: invalid'

  Scenario: Summary Logs uploads (Reprocessor Input) and fails in-sheet revalidation
    Given I have the following summary log upload data for summary log upload
      | s3Bucket   | re-ex-summary-logs                |
      | s3Key      | reprocessor-input-invalid-key     |
      | fileId     | reprocessor-input-invalid-file-id |
      | filename   | reprocessor-input-invalid.xlsx    |
      | fileStatus | complete                          |
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response

    When I check for the summary log status
    Then I should see the following summary log response
      | status | invalid |
    And I should see the following summary log validation failures
      | Code               | Location Sheet                 | Location Table                  | Location Row | Location Header                             | Actual            |
      | VALUE_OUT_OF_RANGE | Received (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_REPROCESSING | 6            | RECYCLABLE_PROPORTION_PERCENTAGE            | 1.75              |
      | VALUE_OUT_OF_RANGE | Received (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_REPROCESSING | 6            | WEIGHT_OF_NON_TARGET_MATERIALS              | 1345              |
      | INVALID_DATE       | Received (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_REPROCESSING | 6            | DATE_RECEIVED_FOR_REPROCESSING              | 30-06-2025        |
      | INVALID_TYPE       | Received (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_REPROCESSING | 6            | WERE_PRN_OR_PERN_ISSUED_ON_THIS_WASTE       | Unsure            |
      | INVALID_TYPE       | Received (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_REPROCESSING | 6            | BAILING_WIRE_PROTOCOL                       | Invalid           |
      | VALUE_OUT_OF_RANGE | Received (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_REPROCESSING | 6            | GROSS_WEIGHT                                | 3500              |
      | VALUE_OUT_OF_RANGE | Received (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_REPROCESSING | 6            | NET_WEIGHT                                  | 1275              |
      | VALUE_OUT_OF_RANGE | Received (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_REPROCESSING | 6            | TARE_WEIGHT                                 | 1115              |
      | VALUE_OUT_OF_RANGE | Received (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_REPROCESSING | 6            | PALLET_WEIGHT                               | 1110              |
      | INVALID_TYPE       | Received (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_REPROCESSING | 6            | DESCRIPTION_WASTE                           | Wrong description |
      | INVALID_TYPE       | Received (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_REPROCESSING | 6            | EWC_CODE                                    | Invalid EWC       |
      | INVALID_TYPE       | Received (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_REPROCESSING | 6            | HOW_DID_YOU_CALCULATE_RECYCLABLE_PROPORTION | Wrong value       |
      | VALUE_OUT_OF_RANGE | Received (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_REPROCESSING | 6            | TONNAGE_RECEIVED_FOR_RECYCLING              | -122.5            |
    When I submit the uploaded summary log
    Then I should receive a 409 error response 'Summary log must be validated before submission. Current status: invalid'

  Scenario: Summary Logs uploads (Reprocessor Input, Sent On sheet) and fails in-sheet revalidation
    Given I have the following summary log upload data for summary log upload
      | s3Bucket   | re-ex-summary-logs                       |
      | s3Key      | reprocessor-input-senton-invalid-key     |
      | fileId     | reprocessor-input-senton-invalid-file-id |
      | filename   | reprocessor-input-senton-invalid.xlsx    |
      | fileStatus | complete                                 |
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response

    When I check for the summary log status
    Then I should see the following summary log response
      | status | invalid |
    And I should see the following summary log validation failures
      | Code               | Location Sheet                | Location Table  | Location Row | Location Header                       | Actual     |
      | INVALID_DATE       | Sent on (sections 5, 6 and 7) | SENT_ON_LOADS   | 4            | DATE_LOAD_LEFT_SITE                   | 30-02-2025 |
      | VALUE_OUT_OF_RANGE | Sent on (sections 5, 6 and 7) | SENT_ON_LOADS   | 4            | TONNAGE_OF_UK_PACKAGING_WASTE_SENT_ON | 1001       |

    When I submit the uploaded summary log
    Then I should receive a 409 error response 'Summary log must be validated before submission. Current status: invalid'

