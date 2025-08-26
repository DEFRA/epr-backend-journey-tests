Feature: Registration endpoint

  Scenario: Ensure that registration endpoint returns a response
    Given I have entered my registration details
    When I submit the registration details
    Then I should receive a registration resource created response

  Scenario: Registration endpoint returns an error if data / answers are not present
    Given I have entered my registration details without data
    When I submit the registration details
    Then I should receive an error response 'Could not extract orgId from answers'

  Scenario: Registration endpoint returns an error if pages information in metadata are not present
    Given I have entered my registration details without pages metadata
    When I submit the registration details
    Then I should receive an error response 'Could not extract orgId from answers'

  Scenario: Registration endpoint returns an error if organisation ID is not present
    Given I have entered my registration details without organisation ID
    When I submit the registration details
    Then I should receive an error response 'Could not extract orgId from answers'

  Scenario: Registration endpoint returns an error if organisation ID is an invalid value
    Given I have entered my registration details with orgId value of 'invalid value'
    When I submit the registration details
    Then I should receive an error response 'Could not extract orgId from answers'

  Scenario: Registration endpoint returns an internal server error if Organisation ID number does not meet does not meet schema validation
    Given I have entered my registration details with orgId value of '5000'
    When I submit the registration details
    Then I should receive an internal server error response

  Scenario: Registration endpoint returns an error if reference number is not present
    Given I have entered my registration details without reference number
    When I submit the registration details
    Then I should receive an error response 'Could not extract referenceNumber from answers'

  Scenario: Registration endpoint returns an error if reference number is an invalid value and does not meet schema validation
    Given I have entered my registration details with reference number value of '50000'
    When I submit the registration details
    Then I should receive an internal server error response

  Scenario: Registration endpoint returns an error if payload is not present
    Given I have not entered any details
    When I submit the registration details
    Then I should receive an error response

  Scenario: Registration endpoint returns an error if payload is not a valid object
    Given I have entered invalid details
    When I submit the registration details
    Then I should receive an error response
