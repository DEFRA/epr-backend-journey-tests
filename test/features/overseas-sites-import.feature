@overseas_sites
@overseas_sites_import
Feature: Overseas Sites - Spreadsheet Import

  Background:
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType |
      | Exporter            |

    Given I am logged in as a service maintainer
    When I update the recently migrated organisations data with the following data
      | regNumber        | accNumber | status   | validFrom  |
      | R25SR500030912PA | ACC123456 | approved | 2025-02-02 |
    Then the organisations data update succeeds

    When I register and authorise a User and link it to the recently migrated organisation
    When I generate the ORS test spreadsheets

  Scenario: Upload a valid ORS spreadsheet and verify sites are created and mapped
    When I initiate an ORS import
    Then the ORS import initiation succeeds

    When I upload the generated file 'ors-valid.xlsx' via the CDP uploader
    Then the upload to CDP uploader succeeds

    When I check the ORS import status
    Then the ORS import status should be 'completed'
    And the ORS import file result should be
      | Status  | SitesCreated |
      | success | 3            |
    And I should see the following overseas sites mapped to the registration
      | OrsId | Name               | Country       | TownOrCity |
      | 001   | Papier Recyclage   | France        | Paris      |
      | 002   | Karton Verarbeiter | Germany       | Berlin     |
      | 003   | Papel Reciclado    | Spain         | Madrid     |

  Scenario: Re-upload the same ORS spreadsheet and verify idempotency
    When I initiate an ORS import
    Then the ORS import initiation succeeds

    When I upload the generated file 'ors-valid.xlsx' via the CDP uploader
    Then the upload to CDP uploader succeeds

    When I check the ORS import status
    Then the ORS import status should be 'completed'

    # Re-upload the same spreadsheet
    When I initiate an ORS import
    Then the ORS import initiation succeeds

    When I upload the generated file 'ors-valid.xlsx' via the CDP uploader
    Then the upload to CDP uploader succeeds

    When I check the ORS import status
    Then the ORS import status should be 'completed'
    And the ORS import file result should be
      | Status  | SitesCreated |
      | success | 3            |
    And the registration should have exactly 3 overseas site mappings

  Scenario: Upload a spreadsheet with validation errors and verify error reporting
    When I initiate an ORS import
    Then the ORS import initiation succeeds

    When I upload the generated file 'ors-invalid.xlsx' via the CDP uploader
    Then the upload to CDP uploader succeeds

    When I check the ORS import status
    Then the ORS import status should be 'completed'
    And the ORS import file result should have errors
