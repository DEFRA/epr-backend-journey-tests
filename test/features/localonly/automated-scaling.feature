@localonly
@automated_scaling
Feature: Automated scaling test for Summary Logs Reprocessor on Input

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

  Scenario: Summary Logs uploads incrementally (Till failure) and creates Waste Records - 2k rows to start with and additional 2k rows thereafter
    Given I have organisation and registration details for summary log upload
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds

    When I upload the file 'reprocessorInput_2000_rows.xlsx' via the CDP uploader with path 'automated_scaling'
    Then the upload to CDP uploader succeeds

    And the summary log submission status is 'validated'

    When I submit the uploaded summary log
    Then the summary log submission succeeds
    And the summary log submission status is 'submitted'

    When I initiate the summary log upload
    Then the summary log upload initiation succeeds

    When I upload the file 'reprocessorInput_4000_rows.xlsx' via the CDP uploader with path 'automated_scaling'
    Then the upload to CDP uploader succeeds

    And the summary log submission status is 'validated'

    When I submit the uploaded summary log
    Then the summary log submission succeeds
    And the summary log submission status is 'submitted'

    When I initiate the summary log upload
    Then the summary log upload initiation succeeds

    When I upload the file 'reprocessorInput_6000_rows.xlsx' via the CDP uploader with path 'automated_scaling'
    Then the upload to CDP uploader succeeds

    And the summary log submission status is 'validated'

    When I submit the uploaded summary log
    Then the summary log submission succeeds
    And the summary log submission status is 'submitted'

    When I initiate the summary log upload
    Then the summary log upload initiation succeeds

    When I upload the file 'reprocessorInput_8000_rows.xlsx' via the CDP uploader with path 'automated_scaling'
    Then the upload to CDP uploader succeeds

    And the summary log submission status is 'validated'

    When I submit the uploaded summary log
    Then the summary log submission succeeds
    And the summary log submission status is 'submitted'
