@organisations
Feature: Organisations endpoint

  Scenario: Ensure that organisations endpoint returns a response
    Given I have access to the get organisations endpoint
    When I request the organisations
    Then I should receive a valid organisations response


