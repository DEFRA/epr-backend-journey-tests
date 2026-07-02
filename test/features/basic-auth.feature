@basic_auth
Feature: Basic auth tests for endpoints exposed to basic auth clients

  Scenario: Ensure that organisations (By ID) endpoint returns a response when using basic auth
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType |
      | Reprocessor         |
    And I use the default basic auth credentials
    When I request the recently migrated organisation via basic auth
    Then I should receive a valid organisations response for the recently migrated organisation

  Scenario: Ensure that overseas site (By ID) endpoint returns a response (Not rejection) when using basic auth
    Given I use the default basic auth credentials
    When I request the overseas sites for organisation 'unknownOrgId', registration 'someRegId' and accreditation 'someAccId' via basic auth
    Then I should receive a 422 error response '"organisationId" with value "unknownOrgId" fails to match the required pattern: /^[a-f0-9]{24}$/. "registrationId" with value "someRegId" fails to match the required pattern: /^[a-f0-9]{24}$/. "accreditationId" with value "someAccId" fails to match the required pattern: /^[a-f0-9]{24}$/'

  Scenario: Ensure that organisations (By ID) endpoint returns a rejection response when using incorrect credentials for basic auth
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType |
      | Reprocessor         |
    And I use the following basic auth credentials
      | username | password |
      | invalid  | invalid  |
    When I request the recently migrated organisation via basic auth
    Then I should receive a 401 error response 'Missing authentication'

  Scenario: Ensure that overseas site (By ID) endpoint returns a rejection response when using incorrect credentials for basic auth
    Given I use the following basic auth credentials
      | username | password |
      | invalid  | invalid  |
    When I request the overseas sites for organisation 'unknownOrgId', registration 'someRegId' and accreditation 'someAccId' via basic auth
    Then I should receive a 401 error response 'Missing authentication'
