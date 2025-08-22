Feature: Organisation endpoint

  Scenario: Ensure that organisation endpoint returns an orgId on response
    Given I have entered my organisation details
    When I submit the organisation details
    Then I should receive the following organisation details response
      | orgId           | ORG12345 |
      | orgName         | ORGABCD  |
      | referenceNumber | REF12345 |

  Scenario: Organisation endpoint returns an error if payload is not present
    Given I have not entered any details
    When I submit the organisation details
    Then I should receive an error response from the organisation endpoint

  Scenario: Organisation endpoint returns an error if payload is not a valid object
    Given I have entered invalid details
    When I submit the organisation details
    Then I should receive an error response from the organisation endpoint
