@smoketest
Feature: Packaging Recycling Notes for Reprocessors on Input smoke test

  Scenario: PRNs are created after waste balance is available for Reprocessor Input
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType |
      | Reprocessor         |

    Given I am logged in as a service maintainer
    When I update the recently migrated organisations data with the following data
      | reprocessingType | regNumber        | accNumber | status   | submittedToRegulator |
      | input            | R25SR500030912PA | ACC123456 | approved | niea                 |
    Then the organisations data update succeeds

    When I register and authorise a User and link it to the recently migrated organisation

    Given I have organisation and registration details for summary log upload
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds

    When I upload the file 'reprocessor-input-valid.xlsx' via the CDP uploader
    Then the upload to CDP uploader succeeds

    When I submit the summary log upload completed with the response from CDP Uploader
    Then I should receive a summary log upload accepted response
    And the summary log submission status is 'validated'

    When I submit the uploaded summary log
    Then the summary log submission succeeds
    And the summary log submission status is 'submitted'

    # Waste balance of 361.62, we are attempting 50, which will be ok
    When I create a PRN with the following details
      | organisationId | testId                  |
      | name           | UK RIVER TABLES LTD     |
      | tradingName    | UK RIVER TABLES LTD - 1 |
      | issuerNotes    | Testing                 |
      | tonnage        | 50                      |
    Then the PRN is successfully created

    When I update the PRN status to 'awaiting_authorisation'
    Then the PRN status is updated successfully

    When I update the PRN status to 'awaiting_acceptance'
    Then the PRN is issued successfully
    # SR because N for NIEA, and R for Reprocessor
    And the PRN number starts with 'NR'

    # External API from RPD
    When an external API accepts the PRN
    Then the external API call to update the PRN status is successful
