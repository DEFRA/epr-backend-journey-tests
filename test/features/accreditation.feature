@accreditation
Feature: Accreditation endpoint

  Scenario: Accreditation endpoint returns an error if pages information in metadata are not present
    Given I have entered my accreditation details without pages metadata
    When I submit the accreditation details
    Then I should receive a 422 error response 'Could not extract orgId from answers'

  Scenario: Accreditation endpoint returns an error if organisation ID is not present
    Given I have entered my accreditation details without organisation ID
    When I submit the accreditation details
    Then I should receive a 422 error response 'Could not extract orgId from answers'

  Scenario: Accreditation endpoint returns an error if organisation ID is an invalid value
    Given I have entered my accreditation details with orgId value of 'invalid value'
    When I submit the accreditation details
    Then I should receive a 422 error response 'Could not extract orgId from answers'
    And the following messages appear in the log
      | Log Level | Event Action     | Message                              |
      | warn      | response_failure | Could not extract orgId from answers |

  Scenario: Accreditation endpoint returns a validation error if Organisation ID number does not meet minimum value
    Given I have entered my accreditation details with orgId '5000' and reference number value of 'abcdef123456fedcba654321'
    When I submit the accreditation details
    Then I should receive a 422 error response 'Organisation ID must be at least 500000'
    And the following messages appear in the log
      | Log Level | Event Action     | Message                                                                                          |
      | warn      | response_failure | orgId: 5000, referenceNumber: abcdef123456fedcba654321 - Organisation ID must be at least 500000 |

  Scenario: Accreditation endpoint returns an error if reference number is not present
    Given I have entered my accreditation details without reference number
    When I submit the accreditation details
    Then I should receive a 422 error response 'Could not extract referenceNumber from answers'
    And the following messages appear in the log
      | Log Level | Event Action     | Message                                        |
      | warn      | response_failure | Could not extract referenceNumber from answers |

  Scenario: Accreditation endpoint returns an error if reference number is an invalid value and does not meet schema validation
    Given I have entered my accreditation details with reference number value of '500000'
    When I submit the accreditation details
    Then I should receive an internal server error response

  Scenario: Accreditation endpoint returns an error if payload is not present
    Given I have not entered any details
    When I submit the accreditation details
    Then I should receive a 400 error response 'Invalid payload'
    And the following messages appear in the log
      | Log Level | Event Action     | Message         |
      | warn      | response_failure | Invalid payload |

  Scenario: Accreditation endpoint returns an error if payload is not a valid object
    Given I have entered invalid details
    When I submit the accreditation details
    Then I should receive a 400 error response 'Invalid payload'
