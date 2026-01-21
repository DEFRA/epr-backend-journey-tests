@smoketest
Feature: Form Submission smoke test

  Scenario: Ensure that form endpoint creates an organisation that has accreditation and registration links
    Given I have entered my organisation details for a non registered UK Sole trader Reprocessor
    When I submit the organisation details
    Then I should receive a successful organisation details response

    Given I have entered my accreditation details as a Reprocessor
    When I submit the accreditation details
    Then I should receive an accreditation resource created response

    Given I have entered my registration details as a Reprocessor for all materials
    When I submit the registration details
    Then I should receive a registration resource created response

    When I migrate the form submissions organisations data
    Then the form submissions organisations data is migrated
