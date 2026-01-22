@summarylogs
@summarylogs_validation
Feature: Summary Logs - Validation tests

  Background:
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType | material   |
      | Reprocessor         |            |

    Given I am logged in as a service maintainer
    When I update the recently migrated organisations data with the following data
      | reprocessingType | regNumber        | accNumber | status   |
      | input            | R25SR500030912PA | ACC123456 | approved |
    Then the organisations data update succeeds

    When I register and authorise a User and link it to the recently migrated organisation

  Scenario: Stale preview is rejected at submission time (deferred staleness detection)
    # User A uploads and validates file 1
    Given I have the following summary log upload data for summary log upload
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
    Given I have the following summary log upload data for summary log upload
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

  Scenario: Summary Logs uploads and fails validation (Fatal) for Invalid Row ID and cannot be submitted
    Given I have the following summary log upload data for summary log upload
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
    Given I have the following summary log upload data for summary log upload
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
    Given I have the following summary log upload data for summary log upload
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
