@authentication
Feature: Unlinking an organisation from its Defra ID organisation

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

  Scenario: A service maintainer can unlink a linked organisation
    When I unlink the recently migrated organisation
    Then the organisation is unlinked successfully

  Scenario: An unlinked organisation can be re-linked
    When I unlink the recently migrated organisation
    Then the organisation is unlinked successfully
    When the User is linked to the recently migrated organisation
    Then the organisation link succeeds

  Scenario: Should not allow unlinking an organisation that is not linked
    When I unlink the recently migrated organisation
    Then the organisation is unlinked successfully
    When I unlink the recently migrated organisation
    Then I should receive a 409 error response 'Organisation is not linked so cannot be unlinked'
