Feature: Organisation endpoint

  Scenario: Ensure that organisation endpoint returns an orgId / reference number and org name on response
    Given I have entered my organisation details
    When I submit the organisation details
    Then I should receive a successful organisation details response with the organisation name 'ACME ltd'

  Scenario: Organisation endpoint returns an error if pages information in metadata are not present
    Given I have entered my organisation details without pages metadata
    When I submit the organisation details
    Then I should receive an error response 'Could not extract email from answers'

  Scenario: Organisation endpoint returns an error if data / answers are not present
    Given I have entered my organisation details without data
    When I submit the organisation details
    Then I should receive an error response 'Could not extract email from answers'

  Scenario: Organisation endpoint returns an error if nations are not present
    Given I have entered my organisation details without nations
    When I submit the organisation details
    Then I should receive an error response 'Could not extract nations from answers'

  Scenario: Organisation endpoint returns an error if nations are an invalid value
    Given I have entered my organisation details with nations value of 'Invalid value'
    When I submit the organisation details
    Then I should receive an error response 'Could not extract nations from answers'

  Scenario: Organisation endpoint returns an error if email is not present
    Given I have entered my organisation details without email
    When I submit the organisation details
    Then I should receive an error response 'Could not extract email from answers'

  Scenario: Organisation endpoint returns an error if organisation name is not present
    Given I have entered my organisation details without organisation name
    When I submit the organisation details
    Then I should receive an error response 'Could not extract organisation name from answers'

  Scenario: Organisation endpoint returns an error if payload is not present
    Given I have not entered any details
    When I submit the organisation details
    Then I should receive an error response

  Scenario: Organisation endpoint returns an error if payload is not a valid object
    Given I have entered invalid details
    When I submit the organisation details
    Then I should receive an error response 'Invalid payload'
