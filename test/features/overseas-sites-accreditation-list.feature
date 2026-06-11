@overseas_sites
@overseas_sites_accreditation_list
Feature: Overseas Sites - Accreditation list

  Scenario: A linked user lists an accreditation's overseas sites with approved and unapproved detail
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType | material            |
      | Exporter            | Paper or board (R3) |

    Given I am logged in as a service maintainer
    And there are no existing overseas sites
    When I update the recently migrated organisations data with the following data
      | regNumber        | accNumber | status   | validFrom  |
      | R25SR500039901PA | ACC990123 | approved | 2025-02-02 |
    Then the organisations data update succeeds

    When I register and authorise a User and link it to the recently migrated organisation
    And I generate the ORS test spreadsheet with the following data
      | orsId | country | name                 | line1            | line2  | townOrCity | stateOrRegion    | postcode | coordinates     | validFrom  |
      | 1     | Norway  | Approved Reprocessor | 11 Fjord Lane    | Unit 1 | Oslo       | Oslo             | 0150     | 59.9139,10.7522 | 2025-03-01 |
      | 2     | Sweden  | Pending Reprocessor  | 22 Harbor Street |        | Stockholm  | Stockholm County | 11122    | 59.3293,18.0686 |            |
    And I initiate an ORS import
    Then the ORS import initiation succeeds

    When I upload ORS file 'ors-valid.xlsx' via the CDP uploader
    Then the upload to CDP uploader succeeds

    When I check the ORS import status
    Then the ORS import status should be 'completed'

    When I request the overseas sites for the accreditation
    Then the accreditation overseas sites response should be keyed by ORS id with the following sites
      | orsId | name                 | country | townOrCity | coordinates     | validFrom                |
      | 001   | Approved Reprocessor | Norway  | Oslo       | 59.9139,10.7522 | 2025-03-01T00:00:00.000Z |
      | 002   | Pending Reprocessor  | Sweden  | Stockholm  | 59.3293,18.0686 |                          |

  Scenario: Unauthenticated request for an accreditation's overseas sites is rejected
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType | material            |
      | Exporter            | Paper or board (R3) |

    Given I am logged in as a service maintainer
    When I update the recently migrated organisations data with the following data
      | regNumber        | accNumber | status   | validFrom  |
      | R25SR500039901PA | ACC990123 | approved | 2025-02-02 |
    Then the organisations data update succeeds

    When I request the overseas sites for the accreditation without authentication
    Then the accreditation overseas sites status should be 401
