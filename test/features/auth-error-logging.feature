@authErrorLogging
@smoketest
Feature: Auth error logging

  Background:
    Given I update the organisations data for id "6507f1f77bcf86cd79943911" with the following payload "./test/fixtures/6507f1f77bcf86cd79943911/payload.json"
    Then the organisations data update succeeds

    Given I register a 'Reprocessor (Input) / Exporter' User to use the system
    And I add a relationship to the 'Reprocessor (Input) / Exporter' User
    When I authorise the User
    And I generate the token
    When the User is linked to the organisation with id '6507f1f77bcf86cd79943911'

  Scenario: Auth errors are logged when user tries to access a different organisation
    When I try to access summary logs for organisation '6507f1f77bcf86cd79943999'
    Then I should receive a 401 error response 'Access denied: organisation mismatch'
    And the following messages appear in the log
      | Log Level | Event Action | Message                              |
      | warn      | auth_failed  | Access denied: organisation mismatch |
