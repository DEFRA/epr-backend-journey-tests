Feature: accreditation endpoint

  Scenario: Ensure that accreditation endpoint returns a response
    Given I have entered my accreditation details
    When I submit the accreditation details
    Then I should receive the following accreditation details response

  Scenario: Accreditation endpoint returns an error if payload is not present
    Given I have not entered any details
    When I submit the accreditation details
    Then I should receive an error response

  Scenario: Accreditation endpoint returns an error if payload is not a valid object
    Given I have entered invalid details
    When I submit the accreditation details
    Then I should receive an error response
