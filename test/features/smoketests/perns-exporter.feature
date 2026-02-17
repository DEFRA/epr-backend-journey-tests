@smoketest
Feature: Packaging Recycling Notes transitions for Exporter

  Scenario: PERNs are created after waste balance is available
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType |
      | Exporter            |

    Given I am logged in as a service maintainer
    When I update the recently migrated organisations data with the following data
      | regNumber        | accNumber | status   | validFrom  | submittedToRegulator |
      | E25SR500030913PA | ACC234567 | approved | 2025-02-02 | sepa                 |
    Then the organisations data update succeeds

    When I register and authorise a User and link it to the recently migrated organisation

    Given I have organisation and registration details for summary log upload
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds

    When I upload the file 'exporter.xlsx' via the CDP uploader
    Then the upload to CDP uploader succeeds

    When I submit the summary log upload completed with the response from CDP Uploader
    Then I should receive a summary log upload accepted response
    And the summary log submission status is 'validated'

    When I submit the uploaded summary log
    Then the summary log submission succeeds
    And the summary log submission status is 'submitted'

    # This time we update it with a tonnage that's below the waste balance limit
    When I create a PRN with the following details
      | organisationId | testId                  |
      | name           | UK RIVER TABLES LTD     |
      | tradingName    | UK RIVER TABLES LTD - 1 |
      | issuerNotes    | Testing                 |
      | tonnage        | 25                      |
    Then the PRN is successfully created

    When I update the PRN status to 'awaiting_authorisation'
    Then the PRN status is updated successfully

    When I update the PRN status to 'awaiting_acceptance'
    Then the PRN is issued successfully
    # SX because S for SEPA, and X for Exporter
    And the PRN number starts with 'SX'

    # External API from RPD
    When an external API rejects the PRN
    Then the external API call to update the PRN status is successful
    # Rejection shifts the PRN to awaiting_cancellation status

    # From here the PRN can be cancelled
    When I update the PRN status to 'cancelled'
    Then the PRN status is updated successfully

