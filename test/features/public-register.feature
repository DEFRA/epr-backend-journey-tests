@publicregister
Feature: Public register endpoint

  Scenario: Public register endpoint returns link to CSV file
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType | material                            |
      | Reprocessor         | Fibre-based composite material (R3) |

    Given I am logged in as a service maintainer
    When I update the recently migrated organisations data with the following data
      | reprocessingType | regNumber    | accNumber        | status   |
      | input            | PUBLICREG123 | TESTPUBLICREG123 | approved |
    Then the organisations data update succeeds

    Given I am logged in as a service maintainer
    When I request the public register
    When I retrieve the public register file
    Then I should see the following public register information
      | Type        | Org ID        | Companies House Number | Registration number | Packaging Waste Category | Annex II Process| Accreditation No | Accreditation status |
      | Reprocessor | {{formOrgId}} |                        | PUBLICREG123        | Fibre based composite    | R3              | TESTPUBLICREG123 | Approved             |
    And the following audit logs are present
      | Event Category  | Event Action | Context Keys                 | Count | Context Values        |
      | public-register | generate     | url, expiresAt, generatedAt  | 1     | {{publicRegisterUrl}} |
