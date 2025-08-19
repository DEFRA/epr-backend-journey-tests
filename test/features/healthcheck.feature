Feature: Healthcheck endpoint success

  Scenario: Ensure that health endpoint returns success on deployment
    Given I have access to the EPR backend endpoint
    When I request the health check
    Then I should receive the health check response
