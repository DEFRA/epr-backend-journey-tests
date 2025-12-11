@summarylogs
Feature: Summary Logs endpoint

  @wip
  Scenario: Summary Logs uploads (With Validation concerns) and creates a Waste Record
    Given I update the organisations data for id "6507f1f77bcf86cd79943911" with the following payload "./test/fixtures/6507f1f77bcf86cd79943911/payload.json"
    Then the organisations data update succeeds
    Given I have the following summary log upload data with a valid organisation and registration details
      | s3Bucket | re-ex-summary-logs              |
      | s3Key    | valid-summary-log-input-key     |
      | fileId   | valid-summary-log-input-file-id |
      | filename | valid-summary-log-input.xlsx    |
      | status   | complete                        |
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response
    And the following messages appear in the log
      | Log Level | Event Action    | Message                                                                                                                                                                                                              |
      | info      | request_success | File upload completed: summaryLogId={{summaryLogId}}, fileId=valid-summary-log-input-file-id, filename=valid-summary-log-input.xlsx, status=complete, s3Bucket=re-ex-summary-logs, s3Key=valid-summary-log-input-key |
      | info      | start_success   | Summary log validation started: summaryLogId={{summaryLogId}}, fileId=valid-summary-log-input-file-id, filename=valid-summary-log-input.xlsx                                                                         |
      | info      | process_success | Extracted summary log file: summaryLogId={{summaryLogId}}, fileId=valid-summary-log-input-file-id, filename=valid-summary-log-input.xlsx                                                                             |
      | info      | process_success | Summary log updated: summaryLogId={{summaryLogId}}, fileId=valid-summary-log-input-file-id, filename=valid-summary-log-input.xlsx, status=validated                                                                  |
    And I should see that a summary log is created in the database with the following values
      | s3Bucket   | re-ex-summary-logs              |
      | s3Key      | valid-summary-log-input-key     |
      | fileId     | valid-summary-log-input-file-id |
      | filename   | valid-summary-log-input.xlsx    |
      | fileStatus | complete                        |
      | status     | validated                       |
    When I check for the summary log status
    Then I should see the following summary log response
      | status  | validated  |
    And I should see the following summary log validation concerns for table "RECEIVED_LOADS_FOR_REPROCESSING", row 10 and sheet "Received (sections 1, 2 and 3)"
      | Type  | Code           | Header   | Column |
      | error | FIELD_REQUIRED | EWC_CODE | F      |

    When I submit the uploaded summary log
    Then the summary log submission succeeds
    And the following messages appear in the log
      | Log Level | Message                                              |
      | info      | Summary log submitted: summaryLogId={{summaryLogId}} |
    And I should see that waste records are created in the database with the following values
      | OrganisationId           | RegistrationId           | RowId | Type     |
      | 6507f1f77bcf86cd79943911 | 6507f1f77bcf86cd79943912 | 1000  | received |
      | 6507f1f77bcf86cd79943911 | 6507f1f77bcf86cd79943912 | 1001  | received |
      | 6507f1f77bcf86cd79943911 | 6507f1f77bcf86cd79943912 | 1002  | received |

    # Summary Logs uploads and fails validation for removed row on second upload. This depends on the previous steps being executed
    Given I have the following summary log upload data with a valid organisation and registration details
      | s3Bucket | re-ex-summary-logs                |
      | s3Key    | valid-summary-log-input-2-key     |
      | fileId   | valid-summary-log-input-2-file-id |
      | filename | valid-summary-log-input-2.xlsx    |
      | status   | complete                          |
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response
    And the following messages appear in the log
      | Log Level | Event Action    | Message                                                                                                                                                                                                                    |
      | info      | request_success | File upload completed: summaryLogId={{summaryLogId}}, fileId=valid-summary-log-input-2-file-id, filename=valid-summary-log-input-2.xlsx, status=complete, s3Bucket=re-ex-summary-logs, s3Key=valid-summary-log-input-2-key |
      | info      | start_success   | Summary log validation started: summaryLogId={{summaryLogId}}, fileId=valid-summary-log-input-2-file-id, filename=valid-summary-log-input-2.xlsx                                                                           |
      | info      | process_success | Extracted summary log file: summaryLogId={{summaryLogId}}, fileId=valid-summary-log-input-2-file-id, filename=valid-summary-log-input-2.xlsx                                                                               |
      | info      | process_success | Summary log updated: summaryLogId={{summaryLogId}}, fileId=valid-summary-log-input-2-file-id, filename=valid-summary-log-input-2.xlsx, status=invalid                                                                      |
    When I check for the summary log status
    Then I should see the following summary log response
      | status | invalid |
    And I should see the following summary log validation failures
      | Code                   | Location Sheet | Location Table                  | Location Row ID |
      | SEQUENTIAL_ROW_REMOVED | Received       | RECEIVED_LOADS_FOR_REPROCESSING | 1001            |
      | SEQUENTIAL_ROW_REMOVED | Received       | RECEIVED_LOADS_FOR_REPROCESSING | 1002            |

    When I submit the uploaded summary log
    Then I should receive a 409 error response 'Summary log must be validated before submission. Current status: invalid'

  @wip
  Scenario: Summary Logs uploads (Reprocessor Input) and fails in-sheet revalidation
    Given I update the organisations data for id "6507f1f77bcf86cd79943911" with the following payload "./test/fixtures/6507f1f77bcf86cd79943911/payload.json"
    Then the organisations data update succeeds
    Given I have the following summary log upload data with a valid organisation and registration details
      | s3Bucket | re-ex-summary-logs                |
      | s3Key    | reprocessor-input-invalid-key     |
      | fileId   | reprocessor-input-invalid-file-id |
      | filename | reprocessor-input-invalid.xlsx    |
      | status   | complete                          |
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response

    And the following messages appear in the log
      | Log Level | Event Action    | Message                                                                                                                                                                                                                    |
      | info      | request_success | File upload completed: summaryLogId={{summaryLogId}}, fileId=reprocessor-input-invalid-file-id, filename=reprocessor-input-invalid.xlsx, status=complete, s3Bucket=re-ex-summary-logs, s3Key=reprocessor-input-invalid-key |
      | info      | start_success   | Summary log validation started: summaryLogId={{summaryLogId}}, fileId=reprocessor-input-invalid-file-id, filename=reprocessor-input-invalid.xlsx                                                                           |
      | info      | process_success | Extracted summary log file: summaryLogId={{summaryLogId}}, fileId=reprocessor-input-invalid-file-id, filename=reprocessor-input-invalid.xlsx                                                                               |
      | info      | process_success | Summary log updated: summaryLogId={{summaryLogId}}, fileId=reprocessor-input-invalid-file-id, filename=reprocessor-input-invalid.xlsx, status=invalid                                                                      |
    When I check for the summary log status
    Then I should see the following summary log response
      | status | invalid |
    And I should see the following summary log validation failures
      | Code               | Location Sheet                 | Location Table                  | Location Row | Location Header                       | Actual            |
      | VALUE_OUT_OF_RANGE | Received (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_REPROCESSING | 10           | RECYCLABLE_PROPORTION_PERCENTAGE      | 1.75              |
      | VALUE_OUT_OF_RANGE | Received (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_REPROCESSING | 10           | WEIGHT_OF_NON_TARGET_MATERIALS        | 1345              |
      | INVALID_DATE       | Received (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_REPROCESSING | 10           | DATE_RECEIVED_FOR_REPROCESSING        | 30-06-2025        |
      | INVALID_TYPE       | Received (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_REPROCESSING | 10           | WERE_PRN_OR_PERN_ISSUED_ON_THIS_WASTE | Unsure            |
      | INVALID_TYPE       | Received (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_REPROCESSING | 10           | BAILING_WIRE_PROTOCOL                 | Invalid           |
      | VALUE_OUT_OF_RANGE | Received (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_REPROCESSING | 10           | GROSS_WEIGHT                          | 3500              |
      | VALUE_OUT_OF_RANGE | Received (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_REPROCESSING | 10           | NET_WEIGHT                            | 1275              |
      | VALUE_OUT_OF_RANGE | Received (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_REPROCESSING | 10           | TARE_WEIGHT                           | 1115              |
      | VALUE_OUT_OF_RANGE | Received (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_REPROCESSING | 10           | PALLET_WEIGHT                         | 1110              |
      | INVALID_TYPE       | Received (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_REPROCESSING | 10           | DESCRIPTION_WASTE                     | Wrong description |
      | INVALID_TYPE       | Received (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_REPROCESSING | 10           | EWC_CODE                              | Invalid EWC       |
    When I submit the uploaded summary log
    Then I should receive a 409 error response 'Summary log must be validated before submission. Current status: invalid'

  @wip
  Scenario: Summary Logs uploads (Reprocessor Input, Sent On sheet) and fails in-sheet revalidation
    Given I update the organisations data for id "6507f1f77bcf86cd79943911" with the following payload "./test/fixtures/6507f1f77bcf86cd79943911/payload.json"
    Then the organisations data update succeeds
    Given I have the following summary log upload data with a valid organisation and registration details
      | s3Bucket | re-ex-summary-logs                       |
      | s3Key    | reprocessor-input-senton-invalid-key     |
      | fileId   | reprocessor-input-senton-invalid-file-id |
      | filename | reprocessor-input-senton-invalid.xlsx    |
      | status   | complete                                 |
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response

    And the following messages appear in the log
      | Log Level | Event Action    | Message                                                                                                                                                                                                                                         |
      | info      | request_success | File upload completed: summaryLogId={{summaryLogId}}, fileId=reprocessor-input-senton-invalid-file-id, filename=reprocessor-input-senton-invalid.xlsx, status=complete, s3Bucket=re-ex-summary-logs, s3Key=reprocessor-input-senton-invalid-key |
      | info      | start_success   | Summary log validation started: summaryLogId={{summaryLogId}}, fileId=reprocessor-input-senton-invalid-file-id, filename=reprocessor-input-senton-invalid.xlsx                                                                                  |
      | info      | process_success | Extracted summary log file: summaryLogId={{summaryLogId}}, fileId=reprocessor-input-senton-invalid-file-id, filename=reprocessor-input-senton-invalid.xlsx                                                                                      |
      | info      | process_success | Summary log updated: summaryLogId={{summaryLogId}}, fileId=reprocessor-input-senton-invalid-file-id, filename=reprocessor-input-senton-invalid.xlsx, status=invalid                                                                             |
    When I check for the summary log status
    Then I should see the following summary log response
      | status | invalid |
    And I should see the following summary log validation failures
      | Code               | Location Sheet                | Location Table  | Location Row | Location Header     | Actual     |
      | INVALID_DATE       | Sent on (sections 5, 6 and 7) | SENT_ON_LOADS   | 8            | DATE_LOAD_LEFT_SITE | 30-02-2025 |

    When I submit the uploaded summary log
    Then I should receive a 409 error response 'Summary log must be validated before submission. Current status: invalid'

  @wip
  Scenario: Summary Logs uploads (Reprocessor Output) and fails in-sheet revalidation
    Given I update the organisations data for id "6507f1f77bcf86cd79943911" with the following payload "./test/fixtures/6507f1f77bcf86cd79943911/payload.json"
    Then the organisations data update succeeds
    Given I have the following summary log upload data with a valid organisation and registration details
      | s3Bucket | re-ex-summary-logs                 |
      | s3Key    | reprocessor-output-invalid-key     |
      | fileId   | reprocessor-output-invalid-file-id |
      | filename | reprocessor-output-invalid.xlsx    |
      | status   | complete                           |
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response

    And the following messages appear in the log
      | Log Level | Event Action    | Message                                                                                                                                                                                                                       |
      | info      | request_success | File upload completed: summaryLogId={{summaryLogId}}, fileId=reprocessor-output-invalid-file-id, filename=reprocessor-output-invalid.xlsx, status=complete, s3Bucket=re-ex-summary-logs, s3Key=reprocessor-output-invalid-key |
      | info      | start_success   | Summary log validation started: summaryLogId={{summaryLogId}}, fileId=reprocessor-output-invalid-file-id, filename=reprocessor-output-invalid.xlsx                                                                            |
      | info      | process_success | Extracted summary log file: summaryLogId={{summaryLogId}}, fileId=reprocessor-output-invalid-file-id, filename=reprocessor-output-invalid.xlsx                                                                                |
      | info      | process_success | Summary log updated: summaryLogId={{summaryLogId}}, fileId=reprocessor-output-invalid-file-id, filename=reprocessor-output-invalid.xlsx, status=invalid                                                                       |
    When I check for the summary log status
    Then I should see the following summary log response
      | status | invalid |
    And I should see the following summary log validation failures
      | Code               | Location Sheet                  | Location Table    | Location Row | Location Header                | Actual     |
      | INVALID_DATE       | Reprocessed (sections 3 and 4)  | REPROCESSED_LOADS | 8            | DATE_LOAD_LEFT_SITE            | 30-06-2025 |
      | VALUE_OUT_OF_RANGE | Reprocessed (sections 3 and 4)  | REPROCESSED_LOADS | 8            | PRODUCT_TONNAGE                | 1005       |
      | VALUE_OUT_OF_RANGE | Reprocessed (sections 3 and 4)  | REPROCESSED_LOADS | 8            | UK_PACKAGING_WEIGHT_PERCENTAGE | 1.1        |
      | INVALID_TYPE       | Reprocessed (sections 3 and 4)  | REPROCESSED_LOADS | 8            | ADD_PRODUCT_WEIGHT             | Invalid    |
    When I submit the uploaded summary log
    Then I should receive a 409 error response 'Summary log must be validated before submission. Current status: invalid'

  @wip
  Scenario: Summary Logs uploads and fails validation (Fatal) for Invalid Row ID and cannot be submitted
    Given I update the organisations data for id "6507f1f77bcf86cd79943911" with the following payload "./test/fixtures/6507f1f77bcf86cd79943911/payload.json"
    Then the organisations data update succeeds
    Given I have the following summary log upload data with a valid organisation and registration details
      | s3Bucket | re-ex-summary-logs     |
      | s3Key    | invalid-row-id-key     |
      | fileId   | invalid-row-id-file-id |
      | filename | invalid-row-id.xlsx    |
      | status   | complete               |
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

  @wip
  Scenario: Summary Logs uploads and fails validation (Fatal) for Invalid Table name and cannot be submitted
    Given I update the organisations data for id "6507f1f77bcf86cd79943911" with the following payload "./test/fixtures/6507f1f77bcf86cd79943911/payload.json"
    Then the organisations data update succeeds
    Given I have the following summary log upload data with a valid organisation and registration details
      | s3Bucket | re-ex-summary-logs         |
      | s3Key    | invalid-table-name-key     |
      | fileId   | invalid-table-name-file-id |
      | filename | invalid-table-name.xlsx    |
      | status   | complete                   |
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

  @wip
  Scenario: Summary Logs upload-completed endpoint accepts upload and marks as invalid when summary log validation fails
    Given I have the following summary log upload data
      | s3Bucket | re-ex-summary-logs       |
      | s3Key    | invalid-test-upload-key  |
      | fileId   | test-upload-file-id      |
      | filename | invalid-test-upload.xlsx |
      | status   | complete                 |
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response
    And the following messages appear in the log
      | Log Level | Event Action    | Message                                                                                                                                                                                          |
      | info      | request_success | File upload completed: summaryLogId={{summaryLogId}}, fileId=test-upload-file-id, filename=invalid-test-upload.xlsx, status=complete, s3Bucket=re-ex-summary-logs, s3Key=invalid-test-upload-key |
      | info      | start_success   | Summary log validation started: summaryLogId={{summaryLogId}}, fileId=test-upload-file-id, filename=invalid-test-upload.xlsx                                                                     |
      | info      | process_success | Summary log updated: summaryLogId={{summaryLogId}}, fileId=test-upload-file-id, filename=invalid-test-upload.xlsx, status=invalid                                                                |
    And I should see that a summary log is created in the database with the following values
      | s3Bucket   | re-ex-summary-logs       |
      | s3Key      | invalid-test-upload-key  |
      | fileId     | test-upload-file-id      |
      | filename   | invalid-test-upload.xlsx |
      | fileStatus | complete                 |
      | status     | invalid                  |
    When I check for the summary log status
    Then I should see the following summary log response
      | status   | invalid  |
    And I should see the following summary log validation failures
      | Code                      | Location Field      |
      | PROCESSING_TYPE_INVALID   | PROCESSING_TYPE     |
      | VALIDATION_FALLBACK_ERROR | PROCESSING_TYPE     |
      | TEMPLATE_VERSION_INVALID  | TEMPLATE_VERSION    |
      | MATERIAL_REQUIRED         | MATERIAL            |
      | REGISTRATION_REQUIRED     | REGISTRATION_NUMBER |

  Scenario: Summary Logs upload-completed endpoint processes with pending status and all required fields
    Given I have the following summary log upload data
      | s3Bucket | re-ex-summary-logs  |
      | s3Key    | test-upload-key     |
      | fileId   | test-upload-file-id |
      | filename | test-upload.xlsx    |
      | status   | pending             |
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
      | s3Bucket | re-ex-summary-logs  |
      | s3Key    | test-upload-key     |
      | fileId   | test-upload-file-id |
      | filename | test-upload.xlsx    |
      | status   | rejected            |
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
      | s3Bucket | re-ex-summary-logs  |
      | s3Key    | test-upload-key     |
      | fileId   | test-upload-file-id |
      | filename | test-upload.xlsx    |
      | status   | <FromTransition>    |
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response
    When the summary log upload data is updated
      | s3Bucket | re-ex-summary-logs  |
      | s3Key    | test-upload-key     |
      | fileId   | test-upload-file-id |
      | filename | test-upload.xlsx    |
      | status   | <ToTransition>      |
    And I submit the summary log upload completed
    Then I should receive a summary log upload accepted response

    Examples:
      | FromTransition | ToTransition |
      | pending        | pending      |
      | pending        | complete     |
      | pending        | rejected     |

  Scenario Outline: Summary Logs upload-completed endpoint invalid state transitions from <FromTransition> to <ToTransition>
    Given I have the following summary log upload data
      | s3Bucket | re-ex-summary-logs  |
      | s3Key    | test-upload-key     |
      | fileId   | test-upload-file-id |
      | filename | test-upload.xlsx    |
      | status   | <FromTransition>    |
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response
    When the summary log upload data is updated
      | s3Bucket | re-ex-summary-logs  |
      | s3Key    | test-upload-key     |
      | fileId   | test-upload-file-id |
      | filename | test-upload.xlsx    |
      | status   | <ToTransition>      |
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
