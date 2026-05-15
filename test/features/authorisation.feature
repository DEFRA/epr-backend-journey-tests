@authorisation
Feature: Authorisation tests for non-write service maintainers
  Rule: Read-only user scope checks
  Background:
    Given I am logged in as a read-only service maintainer

  Scenario: Read only user does not have access to ORS import
    When I initiate an ORS import
    Then I should receive a 403 error response 'Insufficient scope'

  Scenario: Read only user does not have access to unsubmit report
    When I unsubmit the 'monthly' report for the year 2026 and period 1
    Then I should receive a 403 error response 'Insufficient scope'

  Scenario: Read only user does not have access to update organisations
    When I update the organisations with id 'any-id'
    Then I should receive a 403 error response 'Insufficient scope'

  Scenario: Read only user does have access to public register
    When I request the public register
    And I retrieve the public register file
    Then I should see generated at as first row "^Generated at [0-9]{2}\.[0-9]{2}\.[0-9]{2} [0-9]{2}:[0-9]{2}"

  Scenario: Read only user does have access to Admin DLQ Purge endpoint
    When I request the Admin DLQ purge
    Then the request the to Admin DLQ purge succeeds

  Rule: Support only user scope checks
  Background:
    Given I am logged in as a support only service maintainer

  Scenario: Support only user does not have access to Admin DLQ Purge endpoint
    When I request the Admin DLQ purge
    Then I should receive a 403 error response 'Insufficient scope'

    Scenario: Support only user does not have access to ORS import
      When I initiate an ORS import
      Then I should receive a 403 error response 'Insufficient scope'

    Scenario: Support only user does not have access to unsubmit report
      When I unsubmit the 'monthly' report for the year 2026 and period 1
      Then I should receive a 403 error response 'Insufficient scope'

    Scenario: Support only user does not have access to update organisations
      When I update the organisations with id 'any-id'
      Then I should receive a 403 error response 'Insufficient scope'

    Scenario: Support only user does have access to public register
      When I request the public register
      And I retrieve the public register file
      Then I should see generated at as first row "^Generated at [0-9]{2}\.[0-9]{2}\.[0-9]{2} [0-9]{2}:[0-9]{2}"
