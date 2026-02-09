@prn
@pern
@prn_exporter
Feature: Packaging Recycling Notes transitions for Exporter

  Scenario: PERNs are created after waste balance is available
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType |
      | Exporter            |

    Given I am logged in as a service maintainer
    When I update the recently migrated organisations data with the following data
      | regNumber        | accNumber | status   | validFrom  | submittedToRegulator |
      | E25SR500030913PA | ACC234567 | approved | 2025-02-02 | niea                 |
    Then the organisations data update succeeds

    When I register and authorise a User and link it to the recently migrated organisation

    Given I have the following summary log upload data for summary log upload
      | s3Bucket            | re-ex-summary-logs |
      | s3Key               | exporter-key       |
      | fileId              | exporter-file-id   |
      | filename            | exporter.xlsx      |
      | fileStatus          | complete           |
      | accreditationNumber | ACC234567          |
      | registrationNumber  | E25SR500030913PA   |
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response
    And the summary log submission status is 'validated'
    When I submit the uploaded summary log
    Then the summary log submission succeeds
    And the summary log submission status is 'submitted'

    # Waste balance of 30, we are attempting 50, which will be rejected
    When I create a PRN with the following details
      | organisationId | testId                |
      | name           | Test Organisation Ltd |
      | tradingName    | Trading Name          |
      | issuerNotes    | Testing               |
      | tonnage        | 50                    |
      | material       | paper                 |
    Then the PRN is successfully created

    # Valid states -- Newly created PRN starts from "draft" initially
    # draft -> awaiting_authorisation, discarded
    # awaiting_authorisation -> awaiting_acceptance, deleted
    # awaiting_acceptance -> accepted, awaiting_cancellation, possibly cancelled
    # awaiting_cancellation -> cancelled
    When I update the PRN status to 'draft'
    Then I should receive a 400 error response 'Invalid status transition: draft -> draft'

    When I update the PRN status to 'awaiting_authorisation'
    Then I should receive a 409 error response 'Insufficient available waste balance'

    When I update the PRN status to 'discarded'
    Then the PRN status is updated successfully
    And the following audit logs are present
      | Event Category  | Event Subcategory         | Event Action      | Context Keys                          | Context Values                            | Count |
      | waste-reporting | packaging-recycling-notes | status-transition | organisationId, prnId, previous, next | {{summaryLogOrgId}}, {{prnId}}, discarded | 1     |

    # Unable to transition to other PRN statuses
    When I update the PRN status to 'awaiting_authorisation'
    Then I should receive a 400 error response 'Invalid status transition: discarded -> awaiting_authorisation'

    When I update the PRN status to 'draft'
    Then I should receive a 400 error response 'Invalid status transition: discarded -> draft'

    # Delete a Created PRN
    When I create a PRN with the following details
      | organisationId | testId                |
      | name           | Test Organisation Ltd |
      | tradingName    | Trading Name          |
      | issuerNotes    | Testing               |
      | tonnage        | 15                    |
      | material       | paper                 |
    Then the PRN is successfully created

    When I update the PRN status to 'awaiting_authorisation'
    Then the PRN status is updated successfully
    And the following audit logs are present
      | Event Category  | Event Subcategory         | Event Action      | Context Keys                          | Context Values                                         | Count |
      | waste-reporting | packaging-recycling-notes | status-transition | organisationId, prnId, previous, next | {{summaryLogOrgId}}, {{prnId}}, awaiting_authorisation | 1     |

    When I update the PRN status to 'deleted'
    Then the PRN status is updated successfully
    And the following audit logs are present
      | Event Category  | Event Subcategory         | Event Action      | Context Keys                          | Context Values                          | Count |
      | waste-reporting | packaging-recycling-notes | status-transition | organisationId, prnId, previous, next | {{summaryLogOrgId}}, {{prnId}}, deleted | 1     |

    When I update the PRN status to 'awaiting_acceptance'
    Then I should receive a 400 error response 'Invalid status transition: deleted -> awaiting_acceptance'

    # This time we update it with a tonnage that's below the waste balance limit
    When I create a PRN with the following details
      | organisationId | testId                |
      | name           | Test Organisation Ltd |
      | tradingName    | Trading Name          |
      | issuerNotes    | Testing               |
      | tonnage        | 25                    |
      | material       | paper                 |
    Then the PRN is successfully created

    When I update the PRN status to 'awaiting_authorisation'
    Then the PRN status is updated successfully
    And the following audit logs are present
      | Event Category  | Event Subcategory         | Event Action      | Context Keys                          | Context Values                                         | Count |
      | waste-reporting | packaging-recycling-notes | status-transition | organisationId, prnId, previous, next | {{summaryLogOrgId}}, {{prnId}}, awaiting_authorisation | 1     |

    When I update the PRN status to 'awaiting_acceptance'
    Then the PRN is issued successfully
    # NX because N for NIEA, and X for Exporter
    And the PRN number starts with 'NX'
    And the following audit logs are present
      | Event Category  | Event Subcategory         | Event Action      | Context Keys                          | Context Values                                      | Count |
      | waste-reporting | packaging-recycling-notes | status-transition | organisationId, prnId, previous, next | {{summaryLogOrgId}}, {{prnId}}, awaiting_acceptance | 1     |

    # External API from RPD
    When an external API rejects the PRN
    Then the external API call to update the PRN status is successful
    # Rejection shifts the PRN to awaiting_cancellation status

    And the following audit logs are present
      | Event Category  | Event Subcategory         | Event Action      | Context Keys                          | Context Values                                        | Count |
      | waste-reporting | packaging-recycling-notes | status-transition | organisationId, prnId, previous, next | {{summaryLogOrgId}}, {{prnId}}, awaiting_cancellation | 1     |

    # From here the PRN can be cancelled
    When I update the PRN status to 'cancelled'
    Then the PRN status is updated successfully

    And the following audit logs are present
      | Event Category  | Event Subcategory         | Event Action      | Context Keys                          | Context Values                            | Count |
      | waste-reporting | packaging-recycling-notes | status-transition | organisationId, prnId, previous, next | {{summaryLogOrgId}}, {{prnId}}, cancelled | 1     |
