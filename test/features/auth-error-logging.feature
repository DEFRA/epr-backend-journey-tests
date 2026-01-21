@authErrorLogging
@smoketest
Feature: Auth error logging

  Background:
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType |
      | Reprocessor         |

    Given I am logged in as a service maintainer
    When I request the recently migrated organisation
    Then I should receive a valid organisations response for the recently migrated organisation

    Given I update the organisations data with the following data
      | reprocessingType | regNumber        | accNumber | status   |
      | input            | R25SR500030912PA | ACC123456 | approved |
    Then the organisations data update succeeds

    Given I register a User to use the system
    And I add a relationship to the User
    When I authorise the User
    And I generate the token

    When the User is linked to the recently migrated organisation

  Scenario: Auth errors are logged when user tries to access a different organisation
    Given I have organisation and registration details for summary log upload
    When I try to access summary logs for organisation '6507f1f77bcf86cd79943999'
    Then I should receive a 401 error response 'Access denied: organisation mismatch'
    And the following messages appear in the log
      | Log Level | Event Action | Message                              |
      | warn      | auth_failed  | Access denied: organisation mismatch |
