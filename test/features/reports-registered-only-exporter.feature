@reports
@reports_regonly_exporter
Feature: Reports for Registered Only Exporter

  Background:
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType | withoutAccreditation |
      | Exporter            | true                 |

    Given I am logged in as a service maintainer
    When I update the recently migrated organisations data with the following data
      | regNumber        | status   | validFrom  | withoutAccreditation |
      | E25SR500030912PA | approved | 2025-02-02 | true                 |
    Then the organisations data update succeeds

    When I register and authorise a User and link it to the recently migrated organisation

    Given I have the following summary log upload data for summary log upload
      | s3Bucket            | re-ex-summary-logs                |
      | s3Key               | exporter-regonly-valid-key         |
      | fileId              | exporter-regonly-valid-file-id     |
      | filename            | exporter-regonly-valid.xlsx        |
      | fileStatus          | complete                           |
      | registrationNumber  | E25SR500030912PA                   |
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response
    And the summary log submission status is 'validated'
    When I submit the uploaded summary log
    Then the summary log submission succeeds
    And the summary log submission status is 'submitted'

    When I create the 'quarterly' report for the year 2026 and period 1
    Then the report is successfully created

  Scenario: Quarterly report contains expected recycling activity
    When I retrieve the 'quarterly' report for the year 2026 and period 1
    Then the report is successfully retrieved
    And the report contains the following information
      | Key                 | Value    |
      | wasteProcessingType | exporter |
