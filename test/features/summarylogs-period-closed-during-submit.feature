@summarylogs
@period_closed_during_submit
Feature: Summary log submit is blocked when a period closes in the validate-to-submit gap

  # PAE-1686. The open/closed classification a summary log is validated against is
  # computed at validate time. If a periodic report for the registration is submitted
  # between validating and submitting the log, the submit worker's guard must block the
  # submission (PermanentError -> submission_failed) rather than overwrite the
  # now-closed period. The guard is registration-scoped: any report submitted for the
  # registration after the log's createdAt trips it, regardless of the period it covers.

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

    # Upload and validate the log - createdAt is stamped here, the reference the guard keys on.
    Given I have the following summary log upload data for summary log upload
      | s3Bucket            | re-ex-summary-logs          |
      | s3Key               | reprocessor-input-valid-key |
      | fileId              | reprocessor-file-id         |
      | filename            | reprocessor.xlsx            |
      | fileStatus          | complete                    |
      | accreditationNumber | ACC123456                   |
      | registrationNumber  | R25SR500030912PA            |
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response
    And the summary log submission status is 'validated'

  Scenario: Submitting a summary log is blocked when a report closes a period after validation
    # The gap: submit a periodic report for the registration, closing a period. Its
    # SUBMITTED timestamp is after the log's createdAt, which is what the guard keys on.
    When I create the 'monthly' report for the year 2026, period 1 and submissionNumber 1
    Then the report is successfully created
    When I patch the 'monthly' report for the year 2026, period 1 and submissionNumber 1 with
      | tonnageRecycled    | 100.5 |
      | tonnageNotRecycled | 20    |
      | prnRevenue         | 123.4 |
      | freeTonnage        | 0     |
    Then the report patch succeeds
    When I update the 'monthly' report for the year 2026, period 1 and submissionNumber 1 with status 'ready_to_submit' and version 2
    Then the report status is successfully updated
    When I update the 'monthly' report for the year 2026, period 1 and submissionNumber 1 with status 'submitted' and version 3
    Then the report status is successfully updated

    # The POST is accepted (200); the async worker's guard then rejects it -> submission_failed.
    When I submit the uploaded summary log
    Then the summary log submission succeeds
    And the summary log submission status is 'submission_failed'
    And no waste records exist in the database for the summary log registration
