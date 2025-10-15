@summarylogs_upload_completed
@summarylogs
Feature: Summary Logs upload-completed endpoint

  Scenario: Summary Logs upload-completed endpoint processes successfully with all required fields
    Given I have the following summary log upload data
      | s3Bucket | test-upload-bucket  |
      | s3Key    | test-upload-key     |
      | fileId   | test-upload-file-id |
      | filename | test-upload.xlsx    |
      | status   | complete            |
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response
    And the following messages appear in the log
      | Log Level | Event Action    | Message                                                               |
      | info      | request_success | File upload completed: summaryLogId={{summaryLogId}}, fileId=test-upload-file-id, filename=test-upload.xlsx, status=complete, s3Bucket=test-upload-bucket, s3Key=test-upload-key |
      | info      | start_success   | Summary log validation worker started [{{summaryLogId}}]              |
      | info      | process_success | Summary log validation status updated [{{summaryLogId}}] to [invalid] |
      | info      | process_success | Summary log validation worker completed [{{summaryLogId}}]            |

  Scenario: Summary Logs upload-completed endpoint processes with rejected status with all required fields
    Given I have the following summary log upload data
      | s3Bucket | test-upload-bucket  |
      | s3Key    | test-upload-key     |
      | fileId   | test-upload-file-id |
      | filename | test-upload.xlsx    |
      | status   | rejected            |
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response
    And the following messages appear in the log
      | Log Level | Event Action    | Message                                                                                                                      |
      | info      | request_success | File upload completed: summaryLogId={{summaryLogId}}, fileId=test-upload-file-id, filename=test-upload.xlsx, status=rejected |

  Scenario Outline: Summary Logs upload-completed endpoint valid state transitions from <FromTransition> to <ToTransition>
    Given I have the following summary log upload data
      | s3Bucket | test-upload-bucket  |
      | s3Key    | test-upload-key     |
      | fileId   | test-upload-file-id |
      | filename | test-upload.xlsx    |
      | status   | <FromTransition>    |
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response
    When the summary log upload data is updated
      | s3Bucket | test-upload-bucket  |
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
      | s3Bucket | test-upload-bucket  |
      | s3Key    | test-upload-key     |
      | fileId   | test-upload-file-id |
      | filename | test-upload.xlsx    |
      | status   | <FromTransition>    |
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response
    When the summary log upload data is updated
      | s3Bucket | test-upload-bucket  |
      | s3Key    | test-upload-key     |
      | fileId   | test-upload-file-id |
      | filename | test-upload.xlsx    |
      | status   | <ToTransition>      |
    And I submit the summary log upload completed
    Then I should receive a 409 error response 'Cannot transition summary log {{summaryLogId}} from <FromTransitionLog> to <ToTransitionLog>'

    Examples:
      | FromTransition | ToTransition | FromTransitionLog | ToTransitionLog |
      | complete       | rejected     | validating        | rejected        |
      | complete       | pending      | validating        | preprocessing   |
      | rejected       | complete     | rejected          | validating      |
      | rejected       | pending      | rejected          | preprocessing   |
      | rejected       | rejected     | rejected          | rejected        |
      | complete       | complete     | validating        | validating      |

