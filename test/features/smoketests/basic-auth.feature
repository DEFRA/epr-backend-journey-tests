@smoketest
Feature: Basic auth tests for organisation retrieval endpoint

  Scenario: Ensure that organisations (By ID) endpoint returns a response when using basic auth
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType |
      | Reprocessor         |
    And I use the default basic auth credentials
    When I request the recently migrated organisation via basic auth
    Then I should receive a valid organisations response for the recently migrated organisation

  Scenario: Ensure that organisations (By ID) endpoint returns a rejection response when using incorrect credentials for basic auth
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType |
      | Reprocessor         |
    And I use the following basic auth credentials
      | username | password |
      | invalid  | invalid  |
    When I request the recently migrated organisation via basic auth
    Then I should receive a 401 error response 'Missing authentication'
