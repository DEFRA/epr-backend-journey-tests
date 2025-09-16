@zap_tests
Feature: Zap scanner tests

  Scenario: Ensure that organisation endpoint does not return any alerts after Zap scan
    Given I have access to the EPR backend endpoint
    When I request the Zap spider scan to '/v1/apply/organisation'
    And I request the Zap active scan to '/v1/apply/organisation'
    Then I should receive no alerts from the Zap report

  Scenario: Ensure that accreditation endpoint does not return any alerts after Zap scan
    Given I have access to the EPR backend endpoint
    When I request the Zap spider scan to '/v1/apply/accreditation'
    And I request the Zap active scan to '/v1/apply/accreditation'
    Then I should receive no alerts from the Zap report

  Scenario: Ensure that registration endpoint does not return any alerts after Zap scan
    Given I have access to the EPR backend endpoint
    When I request the Zap spider scan to '/v1/apply/registration'
    And I request the Zap active scan to '/v1/apply/registration'
    Then I should receive no alerts from the Zap report
