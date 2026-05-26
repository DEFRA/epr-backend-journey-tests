@basic_auth
Feature: Basic auth tests for organisation retrieval endpoint

  Scenario: Ensure that organisations endpoint returns a response when using basic auth
    Given I use the default basic auth credentials
    When I request the organisations with the following parameters via basic auth
      | page | pageSize |
      | 1    | 1        |
    Then I should receive a valid organisations response
    And I should receive 1 organisation in the response

  Scenario: Ensure that organisations endpoint returns a rejection response when using incorrect credentials for basic auth
    Given I use the following basic auth credentials
      | username | password |
      | invalid  | invalid  |
    When I request the organisations with the following parameters via basic auth
      | page | pageSize |
      | 1    | 1        |
    Then I should receive a 401 error response 'Missing authentication'
