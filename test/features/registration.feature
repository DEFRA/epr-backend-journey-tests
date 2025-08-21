Feature: Registration endpoint

  Scenario: Ensure that registration endpoint returns a response
    Given I have entered my registration details
    When I submit the registration details
    Then I should receive the following registration details response

  Scenario: Registration endpoint returns an error if payload is not present
    Given I have not entered any details
    When I submit the registration details
    Then I should receive an error response

  Scenario: Registration endpoint returns an error if payload is not a valid object
    Given I have entered invalid details
    When I submit the registration details
    Then I should receive an error response
