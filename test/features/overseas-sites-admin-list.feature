@overseas_sites
@overseas_sites_admin_list
Feature: Overseas Sites - Admin list

  Scenario: Service maintainer can list overseas site mappings for admin
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType | material            |
      | Exporter            | Paper or board (R3) |

    Given I am logged in as a service maintainer
    When I update the recently migrated organisations data with the following data
      | regNumber        | accNumber | status   | validFrom  |
      | R25SR500030912PA | ACC123456 | approved | 2025-02-02 |
    Then the organisations data update succeeds

    When I register and authorise a User and link it to the recently migrated organisation
    When I generate the ORS test spreadsheets
    And I initiate an ORS import
    Then the ORS import initiation succeeds

    When I upload ORS file 'ors-valid.xlsx' via the CDP uploader
    Then the upload to CDP uploader succeeds

    When I check the ORS import status
    Then the ORS import status should be 'completed'

    When I request the admin overseas sites list
    Then the admin overseas sites list should include
      | orsId | destinationCountry | overseasReprocessorName | addressLine1         | addressLine2 | cityOrTown | stateProvinceOrRegion | postcode | coordinates      | validFrom                |
      | 001   | France             | Papier Recyclage        | 12 Rue de la Paix    | Batiment B   | Paris      | Ile-de-France         | 75002    | 48.8698,2.3311   | 2025-01-01T00:00:00.000Z |
      | 002   | Germany            | Karton Verarbeiter      | 45 Berliner Strasse  |              | Berlin     | Berlin                | 10115    | 52.5200,13.4050  | 2025-01-01T00:00:00.000Z |
      | 003   | Spain              | Papel Reciclado         | 8 Calle Mayor        | Planta 2     | Madrid     | Madrid                | 28013    | 40.4168,-3.7038  | 2025-01-01T00:00:00.000Z |

  Scenario: Non-service maintainer cannot access admin overseas sites list
    Given I am logged in as a non-service maintainer
    When I request the admin overseas sites list
    Then I should receive a 403 error response 'Insufficient scope'

  Scenario: Unauthenticated request is rejected for admin overseas sites list
    When I request the admin overseas sites list without authentication
    Then the admin overseas sites list status should be 401