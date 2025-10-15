@organisation
Feature: Organisation endpoint

  Scenario: Ensure that organisation endpoint returns an orgId / reference number and organisation name on response
    Given I have entered my organisation details
    When I submit the organisation details
    Then I should receive a successful organisation details response
    And I should see that an organisation details is created in the database
    And the following messages appear in the log
      | Log Level | Event Action    | Message                            |
      | info      | request_success | Stored organisation data for orgId |
    And the following audit logs are present
      | Event Category | Event Action    | Context Keys                              | Count |
      | database       | database_insert | orgId, orgName, referenceNumber           | 1     |
      | email          | email_sent      | templateId, emailAddress, personalisation | 2     |

  Scenario: Organisation endpoint returns an error if pages information in metadata are not present
    Given I have entered my organisation details without pages metadata
    When I submit the organisation details
    Then I should receive a 422 error response 'Could not extract email from answers'

  Scenario: Organisation endpoint returns an error if data / answers are not present
    Given I have entered my organisation details without data
    When I submit the organisation details
    Then I should receive a 422 error response 'Could not extract email from answers'

  Scenario: Organisation endpoint returns an orgId / reference number and organisation name on response if nations are not present
    Given I have entered my organisation details without nations
    When I submit the organisation details
    Then I should receive a successful organisation details response

  Scenario: Organisation endpoint returns an error if email is not present
    Given I have entered my organisation details without email
    When I submit the organisation details
    Then I should receive a 422 error response 'Could not extract email from answers'
    And the following messages appear in the log
      | Log Level | Event Action     | Message                              |
      | warn      | response_failure | Could not extract email from answers |

  Scenario: Organisation endpoint returns an error if organisation name is not present
    Given I have entered my organisation details without organisation name
    When I submit the organisation details
    Then I should receive a 422 error response 'Could not extract organisation name from answers'
    And the following messages appear in the log
      | Log Level | Event Action     | Message                                          |
      | warn      | response_failure | Could not extract organisation name from answers |

  Scenario: Organisation endpoint returns an error if payload is not present
    Given I have not entered any details
    When I submit the organisation details
    Then I should receive a 400 error response 'Invalid payload'
    And the following messages appear in the log
      | Log Level | Event Action     | Message         |
      | warn      | response_failure | Invalid payload |

  Scenario: Organisation endpoint returns an error if payload is not a valid object
    Given I have entered invalid details
    When I submit the organisation details
    Then I should receive a 400 error response 'Invalid payload'
