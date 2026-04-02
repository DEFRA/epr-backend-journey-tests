@overseas_sites
@overseas_sites_admin_list
Feature: Overseas Sites - Admin list

  Scenario: Service maintainer can list overseas site mappings for admin
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType | material            |
      | Exporter            | Paper or board (R3) |

    Given I am logged in as a service maintainer
    And there are no existing overseas sites in the admin list
    When I update the recently migrated organisations data with the following data
      | regNumber        | accNumber | status   | validFrom  |
      | R25SR500039901PA | ACC990123 | approved | 2025-02-02 |
    Then the organisations data update succeeds

    When I register and authorise a User and link it to the recently migrated organisation
    When I generate the admin ORS test spreadsheet
    And I initiate an ORS import
    Then the ORS import initiation succeeds

    When I upload ORS file 'ors-admin-list.xlsx' via the CDP uploader
    Then the upload to CDP uploader succeeds

    When I check the ORS import status
    Then the ORS import status should be 'completed'

    When I request the admin overseas sites list
    Then the admin overseas sites list should include
      | orsId | packagingWasteCategory | orgId         | registrationNumber | accreditationNumber | destinationCountry | overseasReprocessorName   | addressLine1     | addressLine2 | cityOrTown | stateProvinceOrRegion | postcode | coordinates     | validFrom                |
      | 001   | {{any}}                | {{formOrgId}} | R25SR500039901PA   | ACC990123           | Norway             | Nordic Paper Recovery One | 11 Fjord Lane    | Unit 1       | Oslo       | Oslo                  | 0150     | 59.9139,10.7522 | 2025-03-01T00:00:00.000Z |
      | 002   | {{any}}                | {{formOrgId}} | R25SR500039901PA   | ACC990123           | Sweden             | Nordic Paper Recovery Two | 22 Harbor Street |              | Stockholm  | Stockholm County      | 11122    | 59.3293,18.0686 | 2025-03-01T00:00:00.000Z |
      | 003   | {{any}}                | {{formOrgId}} | R25SR500039901PA   | ACC990123           | Denmark            | Nordic Paper Recovery Three | 33 Canal Road  | Dock C       | Copenhagen | Capital Region        | 1050     | 55.6761,12.5683 | 2025-03-01T00:00:00.000Z |

  Scenario: Non-service maintainer cannot access admin overseas sites list
    Given I am logged in as a non-service maintainer
    When I request the admin overseas sites list
    Then I should receive a 403 error response 'Insufficient scope'

  Scenario: Service maintainer can paginate overseas site mappings for admin
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType | material            |
      | Exporter            | Paper or board (R3) |

    Given I am logged in as a service maintainer
    And there are no existing overseas sites in the admin list
    When I update the recently migrated organisations data with the following data
      | regNumber        | accNumber | status   | validFrom  |
      | R25SR500039901PA | ACC990123 | approved | 2025-02-02 |
    Then the organisations data update succeeds

    When I register and authorise a User and link it to the recently migrated organisation
    When I generate the admin ORS test spreadsheet
    And I initiate an ORS import
    Then the ORS import initiation succeeds

    When I upload ORS file 'ors-admin-list.xlsx' via the CDP uploader
    Then the upload to CDP uploader succeeds

    When I check the ORS import status
    Then the ORS import status should be 'completed'

    When I request the admin overseas sites list with page 1 and page size 2
    Then the admin overseas sites pagination should be page 1 of 2 with 3 total items
    And the admin overseas sites list should include
      | orsId | registrationNumber |
      | 001   | R25SR500039901PA   |
      | 002   | R25SR500039901PA   |

    When I request the admin overseas sites list with page 2 and page size 2
    Then the admin overseas sites pagination should be page 2 of 2 with 3 total items
    And the admin overseas sites list should include
      | orsId | registrationNumber |
      | 003   | R25SR500039901PA   |

  Scenario: Service maintainer can request all overseas site mappings for admin
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType | material            |
      | Exporter            | Paper or board (R3) |

    Given I am logged in as a service maintainer
    And there are no existing overseas sites in the admin list
    When I update the recently migrated organisations data with the following data
      | regNumber        | accNumber | status   | validFrom  |
      | R25SR500039901PA | ACC990123 | approved | 2025-02-02 |
    Then the organisations data update succeeds

    When I register and authorise a User and link it to the recently migrated organisation
    When I generate the admin ORS test spreadsheet
    And I initiate an ORS import
    Then the ORS import initiation succeeds

    When I upload ORS file 'ors-admin-list.xlsx' via the CDP uploader
    Then the upload to CDP uploader succeeds

    When I check the ORS import status
    Then the ORS import status should be 'completed'

    When I request the admin overseas sites list with all records
    Then the admin overseas sites pagination should be page 1 of 1 with page size 3 and 3 total items
    And the admin overseas sites list should include
      | orsId | registrationNumber |
      | 001   | R25SR500039901PA   |
      | 002   | R25SR500039901PA   |
      | 003   | R25SR500039901PA   |

  Scenario: Service maintainer can filter overseas site mappings by registration number before pagination
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType | material            |
      | Exporter            | Paper or board (R3) |
      | Exporter            | Steel (R4)          |

    Given I am logged in as a service maintainer
    And there are no existing overseas sites in the admin list
    When I update the recently migrated organisations data with the following data
      | regNumber        | accNumber | status   | validFrom  |
      | R25SR500039901PA | ACC990123 | approved | 2025-02-02 |
      | R25SR500039902PB | ACC990124 | approved | 2025-02-02 |
    Then the organisations data update succeeds

    When I register and authorise a User and link it to the recently migrated organisation
    And I generate the ORS test spreadsheets
    And I initiate an ORS import
    Then the ORS import initiation succeeds

    When I upload ORS files via the CDP uploader
      | filename            |
      | ors-reg1-valid.xlsx |
      | ors-reg2-valid.xlsx |
    Then the upload to CDP uploader succeeds

    When I check the ORS import status
    Then the ORS import status should be 'completed'

    When I request the admin overseas sites list filtered by registration number '039901' with page 1 and page size 2
    Then the admin overseas sites pagination should be page 1 of 2 with 3 total items
    And the admin overseas sites list should include
      | orsId | registrationNumber |
      | 001   | R25SR500039901PA   |
      | 002   | R25SR500039901PA   |

    When I request the admin overseas sites list filtered by registration number '039901' with page 2 and page size 2
    Then the admin overseas sites pagination should be page 2 of 2 with 3 total items
    And the admin overseas sites list should include
      | orsId | registrationNumber |
      | 003   | R25SR500039901PA   |

  Scenario: Unauthenticated request is rejected for admin overseas sites list
    When I request the admin overseas sites list without authentication
    Then the admin overseas sites list status should be 401