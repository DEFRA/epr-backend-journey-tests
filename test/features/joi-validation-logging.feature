@joiValidationLogging
Feature: Joi validation error logging

  Background:
    Given I update the organisations data for id "6507f1f77bcf86cd79943911" with the following payload "./test/fixtures/6507f1f77bcf86cd79943911/payload.json"
    Then the organisations data update succeeds

    Given I register a 'Reprocessor (Input) / Exporter' User to use the system
    And I add a relationship to the 'Reprocessor (Input) / Exporter' User
    When I authorise the User
    And I generate the token
    When the User is linked to the organisation with id '6507f1f77bcf86cd79943911'

  Scenario: Joi validation errors include field-level details in logs
    When I initiate the summary log upload without redirectUrl
    Then I should receive a 422 error response '"redirectUrl" is required'
    And the following messages appear in the log
      | Log Level | Event Action     | Message                               |
      | warn      | response_failure | "redirectUrl" is required \| data: [{ |
