@reports
@reports_resubmission
Feature: Resubmission drafts for restated closed periods

  # PAE-1650. When a summary log adjusts loads in a period whose report has
  # already been submitted (a closed period), the backend flags the submitted
  # report as requiring resubmission and permits a second submission to be
  # drafted for that period. Requires FEATURE_FLAG_CLOSED_PERIOD_ADJUSTMENTS
  # to be on in the backend under test (defaulted on in compose.yml).

  # The year and period below (August 2025) are fixed: the summary-log upload
  # step accepts loads only within its compliance window, so this scenario will
  # need its dates advancing once 2025 falls outside that window.
  Background:
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType |
      | Reprocessor         |

    Given I am logged in as a service maintainer
    When I update the recently migrated organisations data with the following data
      | reprocessingType | regNumber        | accNumber | status   | validFrom  |
      | input            | R25SR500030912PA | ACC123456 | approved | 2025-02-02 |
    Then the organisations data update succeeds

    When I register and authorise a User and link it to the recently migrated organisation

    # First summary log creates the waste records, including loads received on
    # 2025-08-01 (rows 1000-1002).
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
    When I submit the uploaded summary log
    Then the summary log submission succeeds
    And the summary log submission status is 'submitted'

    # Close August 2025 by submitting the period's report.
    When I create the 'monthly' report for the year 2025, period 8 and submissionNumber 1
    Then the report is successfully created
    When I patch the 'monthly' report for the year 2025, period 8 and submissionNumber 1 with
      | tonnageRecycled    | 100.5 |
      | tonnageNotRecycled | 20    |
      | prnRevenue         | 123.4 |
      | freeTonnage        | 0     |
    Then the report patch succeeds
    When I update the 'monthly' report for the year 2025, period 8 and submissionNumber 1 with status 'ready_to_submit' and version 2
    Then the report status is successfully updated
    When I update the 'monthly' report for the year 2025, period 8 and submissionNumber 1 with status 'submitted' and version 3
    Then the report status is successfully updated

    # The second summary log adjusts row 1001 (received 2025-08-01), restating
    # the now-closed August period; submitting it flags the submitted report as
    # requiring resubmission.
    Given I have the following summary log upload data for summary log upload
      | s3Bucket   | re-ex-summary-logs                    |
      | s3Key      | reprocessor-input-adjustments-key     |
      | fileId     | reprocessor-input-adjustments-file-id |
      | filename   | reprocessor-input-adjustments.xlsx    |
      | fileStatus | complete                              |
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response
    And the summary log submission status is 'validated'
    When I submit the uploaded summary log
    Then the summary log submission succeeds
    And the summary log submission status is 'submitted'

  Scenario: A resubmission draft can be created and submitted for a restated closed period
    # The flagged period yields two calendar items: the submitted report stays
    # visible and a pre-draft resubmission slot prompts the correction.
    When I retrieve the reports calendar
    Then the reports calendar is successfully retrieved
    And the reports calendar contains the following items for the year 2025 and period 8
      | SubmissionNumber | PeriodStatus          | ReportStatus |
      | 1                | submitted             | submitted    |
      | 2                | requires_resubmission | none         |

    # With the closed-period-adjustments flag on, drafting submission 2 for the
    # flagged period is permitted.
    When I create the 'monthly' report for the year 2025, period 8 and submissionNumber 2
    Then the report is successfully created

    # The resubmission slot now carries the in-flight draft; the original
    # submitted item is unchanged and the period has not collapsed.
    When I retrieve the reports calendar
    Then the reports calendar is successfully retrieved
    And the reports calendar contains the following items for the year 2025 and period 8
      | SubmissionNumber | PeriodStatus          | ReportStatus |
      | 1                | submitted             | submitted    |
      | 2                | requires_resubmission | in_progress  |

    # Submitting the resubmission collapses the period back to a single
    # submitted item.
    When I patch the 'monthly' report for the year 2025, period 8 and submissionNumber 2 with
      | tonnageRecycled    | 110.5 |
      | tonnageNotRecycled | 20    |
      | prnRevenue         | 123.4 |
      | freeTonnage        | 0     |
    Then the report patch succeeds
    When I update the 'monthly' report for the year 2025, period 8 and submissionNumber 2 with status 'ready_to_submit' and version 2
    Then the report status is successfully updated
    When I update the 'monthly' report for the year 2025, period 8 and submissionNumber 2 with status 'submitted' and version 3
    Then the report status is successfully updated

    When I retrieve the reports calendar
    Then the reports calendar is successfully retrieved
    And the reports calendar contains the following items for the year 2025 and period 8
      | SubmissionNumber | PeriodStatus | ReportStatus |
      | 2                | submitted    | submitted    |
