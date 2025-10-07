@registration
Feature: Registration endpoint

  Scenario: Ensure that registration endpoint returns a response
    Given I have entered my registration details
    When I submit the registration details
    Then I should receive a registration resource created response
    And I should see that a registration is created in the database
    And the following information appears in the log
      | Log Level    | info                                |
      | Event Action | request_success                     |
      | Message      | Stored registration data for orgId  |
    And the following audit logs are present
      | Event Category | Event Action    | Context Keys           | Count |
      | database       | database_insert | orgId, referenceNumber | 1     |

  Scenario: Registration endpoint returns an error if data / answers are not present
    Given I have entered my registration details without data
    When I submit the registration details
    Then I should receive a 422 error response 'Could not extract orgId from answers'

  Scenario: Registration endpoint returns an error if pages information in metadata are not present
    Given I have entered my registration details without pages metadata
    When I submit the registration details
    Then I should receive a 422 error response 'Could not extract orgId from answers'

  Scenario: Registration endpoint returns an error if organisation ID is not present
    Given I have entered my registration details without organisation ID
    When I submit the registration details
    Then I should receive a 422 error response 'Could not extract orgId from answers'

  Scenario: Registration endpoint returns an error if organisation ID is an invalid value
    Given I have entered my registration details with orgId value of 'invalid value'
    When I submit the registration details
    Then I should receive a 422 error response 'Could not extract orgId from answers'
    And the following information appears in the log
      | Log Level    | warn                                 |
      | Event Action | response_failure                     |
      | Message      | Could not extract orgId from answers |

  Scenario: Registration endpoint returns a validation error if Organisation ID number does not meet minimum value
    Given I have entered my registration details with orgId '5000' and reference number value of 'abcd1234ef567890abcd1234'
    When I submit the registration details
    Then I should receive a 422 error response 'Organisation ID must be at least 500000'
    And the following information appears in the log
      | Log Level    | warn                                                                                            |
      | Event Action | response_failure                                                                                |
      | Message      | orgId: 5000, referenceNumber: abcd1234ef567890abcd1234 - Organisation ID must be at least 500000 |

  Scenario: Registration endpoint returns an error if reference number is not present
    Given I have entered my registration details without reference number
    When I submit the registration details
    Then I should receive a 422 error response 'Could not extract referenceNumber from answers'

  Scenario: Registration endpoint returns an error if reference number is an invalid value and does not meet schema validation
    Given I have entered my registration details with orgId '500123' and reference number value of '50000'
    When I submit the registration details
    Then I should receive an internal server error response
    And the following information appears in the log
      | Log Level    | error                             |
      | Event Action | response_failure                  |
      | Message      | Failure on /v1/apply/registration for orgId: 500123 and referenceNumber: 50000, mongo validation failures: referenceNumber - 'referenceNumber' must be a string and is required |

  Scenario: Registration endpoint returns an error if payload is not present
    Given I have not entered any details
    When I submit the registration details
    Then I should receive a 400 error response 'Invalid payload'
    And the following information appears in the log
      | Log Level    | warn             |
      | Event Action | response_failure |
      | Message      | Invalid payload  |

  Scenario: Registration endpoint returns an error if payload is not a valid object
    Given I have entered invalid details
    When I submit the registration details
    Then I should receive a 400 error response 'Invalid payload'
