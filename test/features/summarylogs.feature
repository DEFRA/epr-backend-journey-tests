@summarylogs
Feature: Summary Logs endpoint

  Background:
    Given I update the organisations data for id "6507f1f77bcf86cd79943911" with the following payload "./test/fixtures/6507f1f77bcf86cd79943911/payload.json"
    Then the organisations data update succeeds

    Given I register a 'Reprocessor (Input) / Exporter' User to use the system
    And I add a relationship to the 'Reprocessor (Input) / Exporter' User
    When I authorise the User
    And I generate the token

    When the User is linked to the organisation with id '6507f1f77bcf86cd79943911'

    @vali
  Scenario: Summary Logs uploads (With Validation concerns) and creates a Waste Record
    Given I have valid organisation and registration details for summary log upload with waste processing type 'reprocessorInput'
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
      | Event Category  | Event Action | Context Keys                                 | Count |
      | waste-reporting | submit       | summaryLogId, organisationId, registrationId | 1     |
    And I should see that waste records are created in the database with the following values
      | OrganisationId           | RegistrationId           | RowId | Type      |
      | 6507f1f77bcf86cd79943911 | 6507f1f77bcf86cd79943912 | 1000  | received  |
      | 6507f1f77bcf86cd79943911 | 6507f1f77bcf86cd79943912 | 1001  | received  |
      | 6507f1f77bcf86cd79943911 | 6507f1f77bcf86cd79943912 | 1002  | received  |
      | 6507f1f77bcf86cd79943911 | 6507f1f77bcf86cd79943912 | 4000  | processed |
      | 6507f1f77bcf86cd79943911 | 6507f1f77bcf86cd79943912 | 5000  | sentOn    |
    And the submitted summary log should not have an expiry
    And I should see that waste balances are created in the database with the following values
      | OrganisationId           | AccreditationId          | Amount | AvailableAmount |
      | 6507f1f77bcf86cd79943911 | 68f6a147c117aec8a1ab7497 | 361.62 | 361.62          |

    # Summary Logs uploads and fails validation for removed row on second upload. This depends on the previous steps being executed
    Given I have the following summary log upload data with a valid organisation and registration details
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

  Scenario: Stale preview is rejected at submission time (deferred staleness detection)
    # User A uploads and validates file 1
    Given I have the following summary log upload data with a valid organisation and registration details
      | s3Bucket   | re-ex-summary-logs                |
      | s3Key      | staleness-test-file-1-key         |
      | fileId     | staleness-test-file-1-id          |
      | filename   | staleness-test-file-1.xlsx        |
      | fileStatus | complete                          |
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response
    When I check for the summary log status
    Then I should see the following summary log response
      | status | validated |
    And I call this upload 'first'

    # User B uploads and validates file 2 (both coexist - no blocking)
    Given I have the following summary log upload data with a valid organisation and registration details
      | s3Bucket    | re-ex-summary-logs         |
      | s3Key       | staleness-test-file-2-key  |
      | fileId      | staleness-test-file-2-id   |
      | filename    | staleness-test-file-2.xlsx |
      | fileStatus  | complete                   |
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response
    When I check for the summary log status
    Then I should see the following summary log response
      | status | validated |
    And I call this upload 'second'

    # User A submits file 1 successfully
    When I return to the 'first' upload
    And I submit the uploaded summary log
    Then the summary log submission succeeds
    And the following messages appear in the log
      | Log Level | Message                                              |
      | info      | Summary log submitted: summaryLogId={{summaryLogId}} |

    # User B tries to submit file 2 - rejected because preview is now stale
    When I return to the 'second' upload
    And I submit the uploaded summary log
    Then I should receive a 409 error response 'Waste records have changed since preview was generated. Please re-upload.'

    # Verify stale summary log is marked as superseded
    When I check for the summary log status
    Then I should see the following summary log response
      | status | superseded |

  Scenario: Summary Logs uploads (Reprocessor Input) and fails in-sheet revalidation
    Given I have the following summary log upload data with a valid organisation and registration details
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
    Given I have the following summary log upload data with a valid organisation and registration details
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

  Scenario: Summary Logs uploads (Reprocessor Output) and fails in-sheet revalidation
    Given I update the organisations data for id "6507f1f77bcf86cd79943931" with the following payload "./test/fixtures/6507f1f77bcf86cd79943931/payload.json"
    Then the organisations data update succeeds

    Given I register a 'Reprocessor (Output) / Exporter' User to use the system
    And I add a relationship to the 'Reprocessor (Output) / Exporter' User
    When I authorise the User
    And I generate the token

    When the User is linked to the organisation with id '6507f1f77bcf86cd79943931'

    Given I have the following summary log upload data with a valid organisation and registration details
      | s3Bucket       | re-ex-summary-logs                 |
      | s3Key          | reprocessor-output-invalid-key     |
      | fileId         | reprocessor-output-invalid-file-id |
      | filename       | reprocessor-output-invalid.xlsx    |
      | fileStatus     | complete                           |
      | processingType | reprocessorOutput-exporter         |
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response

    When I check for the summary log status
    Then I should see the following summary log response
      | status | invalid |
    And I should see the following summary log validation failures
      | Code               | Location Sheet                  | Location Table    | Location Row | Location Header                        | Actual     |
      | INVALID_DATE       | Reprocessed (sections 3 and 4)  | REPROCESSED_LOADS | 4            | DATE_LOAD_LEFT_SITE                    | 30-06-2025 |
      | VALUE_OUT_OF_RANGE | Reprocessed (sections 3 and 4)  | REPROCESSED_LOADS | 4            | PRODUCT_TONNAGE                        | 1005       |
      | VALUE_OUT_OF_RANGE | Reprocessed (sections 3 and 4)  | REPROCESSED_LOADS | 4            | UK_PACKAGING_WEIGHT_PERCENTAGE         | 1.1        |
      | INVALID_TYPE       | Reprocessed (sections 3 and 4)  | REPROCESSED_LOADS | 4            | ADD_PRODUCT_WEIGHT                     | Invalid    |
      | VALUE_OUT_OF_RANGE | Reprocessed (sections 3 and 4)  | REPROCESSED_LOADS | 4            | PRODUCT_UK_PACKAGING_WEIGHT_PROPORTION | 1105.5     |
    When I submit the uploaded summary log
    Then I should receive a 409 error response 'Summary log must be validated before submission. Current status: invalid'

  Scenario: Summary Logs uploads (Reprocessor Output) and succeeds, with waste balance calculated for Sent On
    Given I update the organisations data for id "6507f1f77bcf86cd79943931" with the following payload "./test/fixtures/6507f1f77bcf86cd79943931/payload.json"
    Then the organisations data update succeeds

    Given I register a 'Reprocessor (Output) / Exporter' User to use the system
    And I add a relationship to the 'Reprocessor (Output) / Exporter' User
    When I authorise the User
    And I generate the token

    When the User is linked to the organisation with id '6507f1f77bcf86cd79943931'

    Given I have the following summary log upload data with a valid organisation and registration details
      | s3Bucket       | re-ex-summary-logs               |
      | s3Key          | reprocessor-output-valid-key     |
      | fileId         | reprocessor-output-valid-file-id |
      | filename       | reprocessor-output-valid.xlsx    |
      | fileStatus     | complete                         |
      | processingType | reprocessorOutput-exporter       |
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response
    And the summary log submission status is 'validated'
    When I submit the uploaded summary log
    Then the summary log submission succeeds
    And the summary log submission status is 'submitted'
    And I should see that waste records are created in the database with the following values
      | OrganisationId           | RegistrationId           | RowId | Type      |
      | 6507f1f77bcf86cd79943931 | 6507f1f77bcf86cd79943932 | 1000  | received  |
      | 6507f1f77bcf86cd79943931 | 6507f1f77bcf86cd79943932 | 1001  | received  |
      | 6507f1f77bcf86cd79943931 | 6507f1f77bcf86cd79943932 | 1002  | received  |
      | 6507f1f77bcf86cd79943931 | 6507f1f77bcf86cd79943932 | 3000  | processed |
      | 6507f1f77bcf86cd79943931 | 6507f1f77bcf86cd79943932 | 5000  | sentOn    |
      | 6507f1f77bcf86cd79943931 | 6507f1f77bcf86cd79943932 | 5001  | sentOn    |
    And I should see that waste balances are created in the database with the following values
      | OrganisationId           | AccreditationId          | Amount | AvailableAmount |
      | 6507f1f77bcf86cd79943931 | 68f6a147c117aec8a1ab749a | 3      | 3               |

  Scenario: Summary Logs uploads (Exporter) and fails in-sheet revalidation
    Given I have the following summary log upload data with a valid organisation and registration details
      | s3Bucket       | re-ex-summary-logs       |
      | s3Key          | exporter-invalid-key     |
      | fileId         | exporter-invalid-file-id |
      | filename       | exporter-invalid.xlsx    |
      | fileStatus     | complete                 |
      | processingType | exporter                 |
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response

    When I check for the summary log status
    Then I should see the following summary log response
      | status | invalid |
    And I should see the following summary log validation failures
      | Code               | Location Sheet                 | Location Table            | Location Row | Location Header                             | Actual                                                                                                             |
      | INVALID_DATE       | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | DATE_OF_EXPORT                              | 22-01-2025                                                                                                         |
      | VALUE_OUT_OF_RANGE | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | CONTAINER_NUMBER                            | ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789098765432101234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789098765432101234567890 |
      | VALUE_OUT_OF_RANGE | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | CUSTOMS_CODES                               | ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789098765432101234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789098765432101234567890 |
      | VALUE_OUT_OF_RANGE | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | TONNAGE_OF_UK_PACKAGING_WASTE_EXPORTED      | 1002                                                                                                               |
      | VALUE_OUT_OF_RANGE | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | WEIGHT_OF_NON_TARGET_MATERIALS              | 1005                                                                                                               |
      | VALUE_OUT_OF_RANGE | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | RECYCLABLE_PROPORTION_PERCENTAGE            | 1.1                                                                                                                |
      | INVALID_TYPE       | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | DID_WASTE_PASS_THROUGH_AN_INTERIM_SITE      | notValid                                                                                                           |
      | INVALID_TYPE       | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | EWC_CODE                                    | Invalid EWC                                                                                                        |
      | INVALID_TYPE       | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | BASEL_EXPORT_CODE                           | NotABasel                                                                                                          |
      | INVALID_TYPE       | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | BAILING_WIRE_PROTOCOL                       | Invalid                                                                                                            |
      | INVALID_TYPE       | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | DESCRIPTION_WASTE                           | WrongDesc                                                                                                          |
      | VALUE_OUT_OF_RANGE | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | GROSS_WEIGHT                                | 1010                                                                                                               |
      | VALUE_OUT_OF_RANGE | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | NET_WEIGHT                                  | -50                                                                                                                |
      | VALUE_OUT_OF_RANGE | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | TARE_WEIGHT                                 | -10                                                                                                                |
      | VALUE_OUT_OF_RANGE | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | PALLET_WEIGHT                               | -50                                                                                                                |
      | VALUE_OUT_OF_RANGE | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | INTERIM_SITE_ID                             | 99                                                                                                                 |
      | VALUE_OUT_OF_RANGE | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | TONNAGE_PASSED_INTERIM_SITE_RECEIVED_BY_OSR | -50                                                                                                                |
      | INVALID_TYPE       | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | OSR_ID                                      | 98A                                                                                                                |
      | INVALID_DATE       | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | DATE_RECEIVED_BY_OSR                        | 30-02-2025                                                                                                         |
      | INVALID_DATE       | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | DATE_RECEIVED_FOR_EXPORT                    | 26-06-2025                                                                                                         |
      | INVALID_TYPE       | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | WERE_PRN_OR_PERN_ISSUED_ON_THIS_WASTE       | Unknown                                                                                                            |
      | INVALID_TYPE       | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | HOW_DID_YOU_CALCULATE_RECYCLABLE_PROPORTION | Invalid                                                                                                            |
      | VALUE_OUT_OF_RANGE | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | TONNAGE_RECEIVED_FOR_EXPORT                 | -1160.5                                                                                                            |
    When I submit the uploaded summary log
    Then I should receive a 409 error response 'Summary log must be validated before submission. Current status: invalid'

  Scenario: Summary Logs uploads (Exporter) and succeeds, with waste balance calculated
    Given I have the following summary log upload data with a valid organisation and registration details
      | s3Bucket       | re-ex-summary-logs |
      | s3Key          | exporter-key       |
      | fileId         | exporter-file-id   |
      | filename       | exporter.xlsx      |
      | fileStatus     | complete           |
      | processingType | exporter           |
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response
    And the summary log submission status is 'validated'
    When I submit the uploaded summary log
    Then the summary log submission succeeds
    And the summary log submission status is 'submitted'
    And I should see that waste records are created in the database with the following values
      | OrganisationId           | RegistrationId           | RowId | Type      |
      | 6507f1f77bcf86cd79943931 | 6507f1f77bcf86cd79943932 | 1000  | received  |
      | 6507f1f77bcf86cd79943931 | 6507f1f77bcf86cd79943932 | 1001  | received  |
      | 6507f1f77bcf86cd79943931 | 6507f1f77bcf86cd79943932 | 1002  | received  |
      | 6507f1f77bcf86cd79943931 | 6507f1f77bcf86cd79943932 | 3000  | processed |
      | 6507f1f77bcf86cd79943931 | 6507f1f77bcf86cd79943932 | 5000  | sentOn    |
      | 6507f1f77bcf86cd79943931 | 6507f1f77bcf86cd79943932 | 5001  | sentOn    |
    And I should see that waste balances are created in the database with the following values
      | OrganisationId           | AccreditationId          | Amount | AvailableAmount |
      | 6507f1f77bcf86cd79943911 | 68f6a147c117aec8a1ab7498 | 30     | 30              |

  Scenario: Summary Logs uploads and fails validation (Fatal) for Invalid Row ID and cannot be submitted
    Given I have the following summary log upload data with a valid organisation and registration details
      | s3Bucket   | re-ex-summary-logs     |
      | s3Key      | invalid-row-id-key     |
      | fileId     | invalid-row-id-file-id |
      | filename   | invalid-row-id.xlsx    |
      | fileStatus | complete               |
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response
    When I check for the summary log status
    Then I should see the following summary log response
      | status | invalid |
    And I should see the following summary log validation failures
      | Code               | Location Sheet                 | Location Table                  | Actual |
      | VALUE_OUT_OF_RANGE | Received (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_REPROCESSING | 100    |
      | VALUE_OUT_OF_RANGE | Received (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_REPROCESSING | 101    |
      | VALUE_OUT_OF_RANGE | Received (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_REPROCESSING | 102    |
    When I submit the uploaded summary log
    Then I should receive a 409 error response 'Summary log must be validated before submission. Current status: invalid'

  Scenario: Summary Logs uploads and fails validation (Fatal) for Invalid Table name and cannot be submitted
    Given I have the following summary log upload data with a valid organisation and registration details
      | s3Bucket   | re-ex-summary-logs         |
      | s3Key      | invalid-table-name-key     |
      | fileId     | invalid-table-name-file-id |
      | filename   | invalid-table-name.xlsx    |
      | fileStatus | complete                   |
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response
    When I check for the summary log status
    Then I should see the following summary log response
      | status | invalid |
    And I should see the following summary log validation failures
      | Code               | Location Sheet                 | Location Table |
      | TABLE_UNRECOGNISED | Received (sections 1, 2 and 3) | INVALID_TABLE  |

    When I submit the uploaded summary log
    Then I should receive a 409 error response 'Summary log must be validated before submission. Current status: invalid'

  Scenario: Summary Logs upload-completed endpoint accepts upload and marks as invalid when summary log validation fails
    Given I have the following summary log upload data with a valid organisation and registration details
      | s3Bucket   | re-ex-summary-logs       |
      | s3Key      | invalid-test-upload-key  |
      | fileId     | test-upload-file-id      |
      | filename   | invalid-test-upload.xlsx |
      | fileStatus | complete                 |
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response
    When I check for the summary log status
    Then I should see the following summary log response
      | status   | invalid  |
    And I should see that a summary log is created in the database with the following values
      | s3Bucket   | re-ex-summary-logs       |
      | s3Key      | invalid-test-upload-key  |
      | fileId     | test-upload-file-id      |
      | filename   | invalid-test-upload.xlsx |
      | fileStatus | complete                 |
      | status     | invalid                  |
    And I should see the following summary log validation failures
      | Code                      | Location Field      |
      | PROCESSING_TYPE_INVALID   | PROCESSING_TYPE     |
      | VALIDATION_FALLBACK_ERROR | PROCESSING_TYPE     |
      | TEMPLATE_VERSION_INVALID  | TEMPLATE_VERSION    |
      | MATERIAL_REQUIRED         | MATERIAL            |
      | REGISTRATION_REQUIRED     | REGISTRATION_NUMBER |

  Scenario: Summary Logs upload-completed endpoint processes with pending status and all required fields
    Given I have the following summary log upload data
      | s3Bucket   | re-ex-summary-logs  |
      | s3Key      | test-upload-key     |
      | fileId     | test-upload-file-id |
      | filename   | test-upload.xlsx    |
      | fileStatus | pending             |
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response
    And the following messages appear in the log
      | Log Level | Event Action    | Message                                                                                                                     |
      | info      | request_success | File upload completed: summaryLogId={{summaryLogId}}, fileId=test-upload-file-id, filename=test-upload.xlsx, status=pending |
    And I should see that a summary log is created in the database with the following values
      | fileId     | test-upload-file-id |
      | filename   | test-upload.xlsx    |
      | fileStatus | pending             |
      | status     | preprocessing       |

  Scenario: Summary Logs upload-completed endpoint processes with rejected status with all required fields
    Given I have the following summary log upload data
      | s3Bucket   | re-ex-summary-logs  |
      | s3Key      | test-upload-key     |
      | fileId     | test-upload-file-id |
      | filename   | test-upload.xlsx    |
      | fileStatus | rejected            |
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response
    And the following messages appear in the log
      | Log Level | Event Action    | Message                                                                                                                      |
      | info      | request_success | File upload completed: summaryLogId={{summaryLogId}}, fileId=test-upload-file-id, filename=test-upload.xlsx, status=rejected |
    And I should see that a summary log is created in the database with the following values
      | fileId            | test-upload-file-id |
      | filename          | test-upload.xlsx    |
      | fileStatus        | rejected            |
      | status            | rejected            |
      | validationFailure | FILE_REJECTED       |

  Scenario Outline: Summary Logs upload-completed endpoint valid state transitions from <FromTransition> to <ToTransition>
    Given I have the following summary log upload data
      | s3Bucket   | re-ex-summary-logs  |
      | s3Key      | test-upload-key     |
      | fileId     | test-upload-file-id |
      | filename   | test-upload.xlsx    |
      | fileStatus | <FromTransition>    |
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response
    When the summary log upload data is updated
      | s3Bucket   | re-ex-summary-logs  |
      | s3Key      | test-upload-key     |
      | fileId     | test-upload-file-id |
      | filename   | test-upload.xlsx    |
      | fileStatus | <ToTransition>      |
    And I submit the summary log upload completed
    Then I should receive a summary log upload accepted response

    Examples:
      | FromTransition | ToTransition |
      | pending        | pending      |
      | pending        | complete     |
      | pending        | rejected     |

  Scenario Outline: Summary Logs upload-completed endpoint invalid state transitions from <FromTransition> to <ToTransition>
    Given I have the following summary log upload data
      | s3Bucket   | re-ex-summary-logs  |
      | s3Key      | test-upload-key     |
      | fileId     | test-upload-file-id |
      | filename   | test-upload.xlsx    |
      | fileStatus | <FromTransition>    |
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response
    When the summary log upload data is updated
      | s3Bucket   | re-ex-summary-logs  |
      | s3Key      | test-upload-key     |
      | fileId     | test-upload-file-id |
      | filename   | test-upload.xlsx    |
      | fileStatus | <ToTransition>      |
    And I submit the summary log upload completed
    Then I should receive a 409 error response 'Cannot transition summary log from <FromTransitionLog> to <ToTransitionLog>'
    And the following messages appear in the log
      | Log Level | Event Action     | Message                                                                     |
      | error     | response_failure | Cannot transition summary log from <FromTransitionLog> to <ToTransitionLog> |

    Examples:
      | FromTransition | ToTransition | FromTransitionLog | ToTransitionLog |
      | complete       | rejected     | validating        | rejected        |
      | complete       | pending      | validating        | preprocessing   |
      | rejected       | complete     | rejected          | validating      |
      | rejected       | pending      | rejected          | preprocessing   |
      | rejected       | rejected     | rejected          | rejected        |
      | complete       | complete     | validating        | validating      |
