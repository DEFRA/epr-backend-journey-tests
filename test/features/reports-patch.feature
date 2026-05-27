@reports
@reports_patch
Feature: Reports PATCH endpoint

  Background:
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType |
      | Exporter            |

    Given I am logged in as a service maintainer
    When I update the recently migrated organisations data with the following data
      | regNumber        | accNumber | status   |
      | E25SR500030913PA | ACC234567 | approved |
    Then the organisations data update succeeds

    When I register and authorise a User and link it to the recently migrated organisation

    Given I have the following summary log upload data for summary log upload
      | s3Bucket            | re-ex-summary-logs |
      | s3Key               | exporter-key       |
      | fileId              | exporter-file-id   |
      | filename            | exporter.xlsx      |
      | fileStatus          | complete           |
      | accreditationNumber | ACC234567          |
      | registrationNumber  | E25SR500030913PA   |
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response
    And the summary log submission status is 'validated'
    When I submit the uploaded summary log
    Then the summary log submission succeeds
    And the summary log submission status is 'submitted'

    When I create the report for the year 2026 and period 1
    Then the report is successfully created

  Scenario: PATCH with prnRevenue succeeds for an in_progress report
    When I patch the 'monthly' report for the year 2026 and period 1 with
      | prnRevenue | 1576.12 |
    Then the report patch succeeds
    And the patched report contains the following information
      | Key              | Value   |
      | prn.totalRevenue | 1576.12 |

  Scenario: PATCH with freeTonnage succeeds for an in_progress report
    When I patch the 'monthly' report for the year 2026 and period 1 with
      | freeTonnage | 0 |
    Then the report patch succeeds
    And the patched report contains the following information
      | Key             | Value |
      | prn.freeTonnage | 0     |

  Scenario: PATCH with both prnRevenue and freeTonnage succeeds
    When I patch the 'monthly' report for the year 2026 and period 1 with
      | prnRevenue  | 1576.12 |
      | freeTonnage | 0       |
    Then the report patch succeeds
    And the patched report contains the following information
      | Key              | Value   |
      | prn.totalRevenue | 1576.12 |
      | prn.freeTonnage  | 0       |

  Scenario: PATCH with negative prnRevenue returns 422
    When I patch the 'monthly' report for the year 2026 and period 1 with
      | prnRevenue | -1 |
    Then I should receive a 422 error response '"prnRevenue" must be greater than or equal to 0'

  Scenario: PATCH with empty body returns 422
    When I patch the 'monthly' report for the year 2026 and period 1 with empty body
    Then I should receive a 422 error response '"value" must have at least 1 key'

  Scenario: PATCH for a non-existent period returns 404
    When I patch the 'monthly' report for the year 2026 and period 12 with
      | prnRevenue | 100 |
    Then I should receive a 404 error response 'No report found for monthly period 12 of 2026'

  Scenario: Existing supportingInformation PATCH still works unchanged
    When I patch the 'monthly' report for the year 2026 and period 1 with
      | supportingInformation | Test supporting information |
    Then the report patch succeeds
    And the patched report contains the following information
      | Key                   | Value                       |
      | supportingInformation | Test supporting information |

  Scenario: GET after PATCH returns updated PRN data
    When I patch the 'monthly' report for the year 2026 and period 1 with
      | prnRevenue  | 3000 |
      | freeTonnage | 0    |
    Then the report patch succeeds
    When I retrieve the 'monthly' report for the year 2026 and period 1
    Then the report is successfully retrieved
    And the report contains the following information
      | Key              | Value |
      | prn.totalRevenue | 3000  |
      | prn.freeTonnage  | 0     |
