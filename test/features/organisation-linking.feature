@authentication
Feature: Linking an organisation to its Defra ID organisation

  Background:
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType |
      | Reprocessor         |

    Given I am logged in as a service maintainer

  Scenario: Should not allow linking of an organisation that is not in a linkable state
    When I update the recently migrated organisations data with the following data
      | reprocessingType | regNumber        | accNumber | status   |
      | input            | R25SR500030912PA | ACC123456 | rejected |
    Then the organisations data update succeeds
    When I register and authorise a User and link it to the recently migrated organisation
    Then I should receive a 409 error response 'Organisation is not in a linkable state'
