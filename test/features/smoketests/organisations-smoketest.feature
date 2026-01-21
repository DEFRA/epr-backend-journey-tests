@smoketest
Feature: Organisations smoke test

  Scenario: Ensure that organisations endpoint returns a response
    Given I am logged in as a service maintainer
    And I have access to the get organisations endpoint
    When I request the organisations
    Then I should receive a valid organisations response

  Scenario: Organisations GET and PUT endpoints returns a response
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType |
      | Reprocessor         |
    Given I am logged in as a service maintainer
    And I have access to the get organisations endpoint
    When I request the recently migrated organisation
    Then I should receive a valid organisations response for the recently migrated organisation

    When I update the recently migrated organisation with the following payload
      | updateFragment | response-data |
    Then I should receive a successful update organisations response

  Scenario: Organisations PUT endpoint returns Authorisation error when a non-service maintainer attempts to access endpoint
    Given I am logged in as a non-service maintainer
    And I try to access the get organisations endpoint
    When I request the organisations
    Then I should receive a 403 error response 'Insufficient scope'
