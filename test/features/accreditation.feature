Feature: Accreditation endpoint

  Scenario: Ensure that accreditation endpoint returns a created response when payload is stored into database
    Given I have entered my accreditation details
    When I submit the accreditation details
    Then I should receive an accreditation resource created response
    And the following information appears in the log
      | Log Level    | INFO                                |
      | Event Action | request_success                     |
      | Message      | Stored accreditation data for orgId |
    And the following audit logs are present
      | Event Category | Event Action    | Context Keys           | Count |
      | database       | database_insert | orgId, referenceNumber | 1     |

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
    And the following information appears in the log
      | Log Level    | WARN                                 |
      | Event Action | response_failure                     |
      | Message      | Could not extract orgId from answers |

  Scenario: Accreditation endpoint returns an internal server error if Organisation ID number does not meet schema validation
    Given I have entered my accreditation details with orgId value of '5000'
    When I submit the accreditation details
    Then I should receive an internal server error response
    And the following information appears in the log
      | Log Level    | ERROR                              |
      | Event Action | response_failure                   |
      | Message      | Failure on /v1/apply/accreditation |

  Scenario: Accreditation endpoint returns an error if reference number is not present
    Given I have entered my accreditation details without reference number
    When I submit the accreditation details
    Then I should receive a 422 error response 'Could not extract referenceNumber from answers'
    And the following information appears in the log
      | Log Level    | WARN                                           |
      | Event Action | response_failure                               |
      | Message      | Could not extract referenceNumber from answers |

  Scenario: Accreditation endpoint returns an error if reference number is an invalid value and does not meet schema validation
    Given I have entered my accreditation details with reference number value of '500000'
    When I submit the accreditation details
    Then I should receive an internal server error response

  Scenario: Accreditation endpoint returns an error if payload is not present
    Given I have not entered any details
    When I submit the accreditation details
    Then I should receive a 400 error response 'Invalid payload'
    And the following information appears in the log
      | Log Level    | WARN             |
      | Event Action | response_failure |
      | Message      | Invalid payload  |

  Scenario: Accreditation endpoint returns an error if payload is not a valid object
    Given I have entered invalid details
    When I submit the accreditation details
    Then I should receive a 400 error response 'Invalid payload'
