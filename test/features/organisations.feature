@organisations @wip
Feature: Organisations endpoint

  Scenario: Ensure that organisations endpoint returns a response
    Given I am logged in as a service maintainer
    And I have access to the get organisations endpoint
    When I request the organisations
    Then I should receive a valid organisations response

  Scenario: Organisations PUT endpoint returns an error response when no payload is supplied
    Given I am logged in as a service maintainer
    And I have access to the put organisations endpoint
    When I update the organisations with id 'invalid-id'
    Then I should receive a 400 error response 'Payload must include a numeric version field'

  Scenario: Organisations PUT endpoint returns an error response when updateFragment is not an object
    Given I am logged in as a service maintainer
    And I have access to the put organisations endpoint
    When I update the organisations with id 'invalid-id' with the following payload
    | version        | 1      |
    | updateFragment | string |
    Then I should receive a 400 error response 'Payload must include an updateFragment object'

  # FIXME: Re-enable test later
#  Scenario: Organisations PUT endpoint returns an error response when version is wrong
#    Given I am logged in as a service maintainer
#    And I have access to the get organisations endpoint
#    When I request the organisations with id '6507f1f77bcf86cd79943901'
#    Then I should receive a valid organisations response for '6507f1f77bcf86cd79943901'
#
#    Given I have access to the put organisations endpoint
#    When I update the organisations with id '6507f1f77bcf86cd79943901' with the following payload
#    | version        | 0              |
#    | updateFragment | sample-fixture |
#    Then I should receive a 409 error response 'Version conflict: attempted to update with version 0 but current version is {{version}}'

  Scenario: Organisations PUT endpoint returns a response when the correct payload is used
    Given I am logged in as a service maintainer
    And I have access to the get organisations endpoint
    When I request the organisations with id '6507f1f77bcf86cd79943901'
    Then I should receive a valid organisations response for '6507f1f77bcf86cd79943901'

    Given I have access to the put organisations endpoint
    When I update the organisations with id '6507f1f77bcf86cd79943901' with the following payload
      | updateFragment | {} |
    Then I should receive a successful update organisations response

  Scenario: Organisations PUT endpoint returns a not found response when organisation id is not found
    Given I am logged in as a service maintainer
    And I have access to the get organisations endpoint
    When I request the organisations with id '123456789012345678901234'
    Then I should receive a 404 error response 'Organisation with id 123456789012345678901234 not found'

    Given I have access to the put organisations endpoint
    When I update the organisations with id '123456789012345678901234' with the following payload
      | version        | 1  |
      | updateFragment | {} |
    Then I should receive a 404 error response 'Organisation with id 123456789012345678901234 not found'

    Scenario: Organisations PUT endpoint returns Authorisation error when a non-service maintainer attempts to access endpoint
      Given I am logged in as a non-service maintainer
      And I try to access the get organisations endpoint
      When I request the organisations
      Then I should receive a 403 error response 'Insufficient scope'
