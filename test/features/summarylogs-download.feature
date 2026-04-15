@summarylogs
@summarylogs_download
Feature: Summary Logs file download

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

  Scenario: Summary log file download returns redirect and logs structured event
    Given I have the following summary log upload data for summary log upload
      | s3Bucket   | re-ex-summary-logs    |
      | s3Key      | download-test-key     |
      | fileId     | download-test-file-id |
      | filename   | download-test.xlsx    |
      | fileStatus | complete              |
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response
    When I download the summary log file
    Then the summary log file download redirects to S3
    And the following messages appear in the log
      | Log Level | Event Action    | Message                                                                                                                                  |
      | info      | request_success | Summary log file downloaded for summaryLogId: {{summaryLogId}}, organisationId: {{summaryLogOrgId}}, registrationId: {{summaryLogRegId}} |

  Scenario: Summary log file download returns 404 for non-existent summary log
    When I download a non-existent summary log file
    Then I should receive a 404 error response 'Summary log file not found'
