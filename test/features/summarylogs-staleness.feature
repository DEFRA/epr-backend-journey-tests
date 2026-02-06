@summarylogs
@summarylogs_staleness
Feature: Summary Logs test (Staleness detection)

  Scenario: Stale preview is rejected at submission time (deferred staleness detection)

    Given I create a linked and migrated organisation for the following
      | wasteProcessingType | material   |
      | Reprocessor         |            |

    Given I am logged in as a service maintainer
    When I update the recently migrated organisations data with the following data
      | reprocessingType | regNumber        | accNumber | status   |
      | input            | R25SR500030912PA | ACC123456 | approved |
    Then the organisations data update succeeds

    When I register and authorise a User and link it to the recently migrated organisation

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
