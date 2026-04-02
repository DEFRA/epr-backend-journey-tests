@smoketest
Feature: Packaging Recycling Notes for Exporter smoke test

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

    When I generate the ORS test spreadsheet with the following data
      | orsId | country | name                     | line1             | line2      | townOrCity | stateOrRegion | postcode | coordinates     | validFrom  |
      | 124   | France  | Papier Recyclage         | 12 Rue de la Paix | Batiment B | Paris      | Ile-de-France | 75002    | 48.8698,2.3311  | 2025-01-01 |
      | 099   | Norway  | Nordic Paper Recovery One | 11 Fjord Lane     | Unit 1     | Oslo       | Oslo          | 0150     | 59.9139,10.7522 | 2025-01-01 |

    When I initiate an ORS import
    Then the ORS import initiation succeeds

    When I upload ORS file 'ors-valid.xlsx' via the CDP uploader
    Then the upload to CDP uploader succeeds

    When I check the ORS import status
    Then the ORS import status should be 'completed'

    Given I have organisation and registration details for summary log upload
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds

    When I upload the file 'exporter.xlsx' via the CDP uploader
    Then the upload to CDP uploader succeeds

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
