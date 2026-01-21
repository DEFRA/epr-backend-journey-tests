@formsubmission
Feature: Form Submission (Organisation / Registration / Accreditation) with linked accreditation / registration

  Scenario: Ensure that form endpoint creates an organisation that has accreditation and registration links
    Given I have entered my organisation details for a non registered UK Sole trader Reprocessor
    When I submit the organisation details
    Then I should receive a successful organisation details response
    And I should see that an organisation details is created in the database
    And the following messages appear in the log
      | Log Level | Event Action    | Message                            |
      | info      | request_success | Stored organisation data for orgId |
    And the following audit logs are present
      | Event Category | Event Action    | Context Keys                              | Count | Context Values                                |
      | database       | database_insert | orgId, orgName, referenceNumber           | 1     | {{formOrgId}}, {{formOrgName}}, {{formRefNo}} |
      | email          | email_sent      | templateId, emailAddress, personalisation | 2     | {{formOrgId}}, {{formRefNo}}                  |

    Given I have entered my accreditation details as a Reprocessor
    When I submit the accreditation details
    Then I should receive an accreditation resource created response
    And I should see that an accreditation is created in the database
    And the following messages appear in the log
    | Log Level | Event Action    | Message                             |
    | info      | request_success | Stored accreditation data for orgId |
    And the following audit logs are present
    | Event Category | Event Action    | Context Keys           | Count | Context Values               |
    | database       | database_insert | orgId, referenceNumber | 1     | {{formOrgId}}, {{formRefNo}} |

    Given I have entered my registration details as a Reprocessor for all materials
    When I submit the registration details
    Then I should receive a registration resource created response
    And I should see that a registration is created in the database
    And the following messages appear in the log
      | Log Level | Event Action    | Message                            |
      | info      | request_success | Stored registration data for orgId |
    And the following audit logs are present
      | Event Category | Event Action    | Context Keys           | Count | Context Values               |
      | database       | database_insert | orgId, referenceNumber | 1     | {{formOrgId}}, {{formRefNo}} |

    When I migrate the form submissions organisations data
    Then the form submissions organisations data is migrated
