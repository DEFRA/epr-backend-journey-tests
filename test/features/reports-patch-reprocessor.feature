@reports
@reports_patch_reprocessor
Feature: Reports PATCH endpoint for Reprocessor organisations

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

    Given I have the following summary log upload data for summary log upload
      | s3Bucket            | re-ex-summary-logs   |
      | s3Key               | reprocessor-input-valid-key |
      | fileId              | reprocessor-file-id  |
      | filename            | reprocessor.xlsx     |
      | fileStatus          | complete             |
      | accreditationNumber | ACC123456            |
      | registrationNumber  | R25SR500030912PA     |
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response
    And the summary log submission status is 'validated'
    When I submit the uploaded summary log
    Then the summary log submission succeeds

    When I create the report for the year 2026 and period 1
    Then the report is successfully created

  Scenario: PATCH with tonnageRecycled succeeds for a reprocessor report
    When I patch the 'monthly' report for the year 2026 and period 1 with
      | tonnageRecycled | 100.5 |
    Then the report patch succeeds
    And the patched report contains the following information
      | Key                              | Value |
      | recyclingActivity.tonnageRecycled | 100.5 |

  Scenario: PATCH with tonnageNotRecycled succeeds for a reprocessor report
    When I patch the 'monthly' report for the year 2026 and period 1 with
      | tonnageNotRecycled | 20 |
    Then the report patch succeeds
    And the patched report contains the following information
      | Key                                 | Value |
      | recyclingActivity.tonnageNotRecycled | 20    |

  Scenario: PATCH with both tonnageRecycled and tonnageNotRecycled succeeds
    When I patch the 'monthly' report for the year 2026 and period 1 with
      | tonnageRecycled    | 100 |
      | tonnageNotRecycled | 20  |
    Then the report patch succeeds
    And the patched report contains the following information
      | Key                                 | Value |
      | recyclingActivity.tonnageRecycled    | 100   |
      | recyclingActivity.tonnageNotRecycled | 20    |

  Scenario: PATCH with negative tonnageRecycled returns 422
    When I patch the 'monthly' report for the year 2026 and period 1 with
      | tonnageRecycled | -1 |
    Then I should receive a 422 error response '"tonnageRecycled" must be greater than or equal to 0'
