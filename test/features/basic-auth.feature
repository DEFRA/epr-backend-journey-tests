@basic_auth
Feature: Basic auth tests for organisation retrieval endpoint

  Scenario: Ensure that organisations endpoint returns a response when using basic auth
    Given I use the default basic auth credentials
    When I request the organisations with the following parameters via basic auth
      | page | pageSize |
      | 1    | 1        |
    Then I should receive a valid organisations response
    And I should receive 1 organisation in the response

  Scenario: Ensure that organisations (By ID) endpoint returns a response when using basic auth
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType |
      | Reprocessor         |
    When I request the recently migrated organisation via basic auth
    Then I should receive a valid organisations response for the recently migrated organisation

  Scenario: Ensure that overseas site endpoint returns a response when using basic auth
    Given I use the default basic auth credentials
    When I request the overseas sites list via basic auth
    Then I should receive a valid overseas site list response

  Scenario: Ensure that overseas site (By ID) endpoint returns a response (Not rejection) when using basic auth
    Given I use the default basic auth credentials
    When I request the overseas sites by id 'invalidId' via basic auth
    Then I should receive a 422 error response 'Invalid overseas site ID'
    
  Scenario: Ensure that organisations endpoint returns a rejection response when using incorrect credentials for basic auth
    Given I use the following basic auth credentials
      | username | password |
      | invalid  | invalid  |
    When I request the organisations with the following parameters via basic auth
      | page | pageSize |
      | 1    | 1        |
    Then I should receive a 401 error response 'Missing authentication'

  Scenario: Ensure that organisations (By ID) endpoint returns a rejection response when using incorrect credentials for basic auth
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType |
      | Reprocessor         |
    And I use the following basic auth credentials
      | username | password |
      | invalid  | invalid  |
    When I request the recently migrated organisation via basic auth
    Then I should receive a 401 error response 'Missing authentication'

  Scenario: Ensure that overseas site endpoint returns a rejection response when using incorrect credentials for basic auth
    Given I use the following basic auth credentials
      | username | password |
      | invalid  | invalid  |
    When I request the overseas sites list via basic auth
    Then I should receive a 401 error response 'Missing authentication'

  Scenario: Ensure that overseas site (By ID) endpoint returns a rejection response when using incorrect credentials for basic auth
    Given I use the following basic auth credentials
      | username | password |
      | invalid  | invalid  |
    When I request the overseas sites by id 'invalidId' via basic auth
    Then I should receive a 401 error response 'Missing authentication'
