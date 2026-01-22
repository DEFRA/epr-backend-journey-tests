@summarylogs
@summarylogs_transitions
Feature: Summary Logs state transitions

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
