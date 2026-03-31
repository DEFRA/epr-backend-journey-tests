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

    When I generate the ORS test spreadsheet with the following data
      | orsId | country | name                      | line1             | line2      | townOrCity | stateOrRegion | postcode | coordinates     | validFrom  |
      | 124   | France  | Papier Recyclage          | 12 Rue de la Paix | Batiment B | Paris      | Ile-de-France | 75002    | 48.8698,2.3311  | 2025-01-01 |
      | 099   | Norway  | Nordic Paper Recovery One | 11 Fjord Lane     | Unit 1     | Oslo       | Oslo          | 0150     | 59.9139,10.7522 | 2025-01-01 |

    When I initiate an ORS import
    Then the ORS import initiation succeeds

    When I upload ORS file 'ors-valid.xlsx' via the CDP uploader
    Then the upload to CDP uploader succeeds

    When I check the ORS import status
    Then the ORS import status should be 'completed'

    And I should see the following overseas sites mapped to the registration
      | OrsId | Name                        | Country       | TownOrCity |
      | 124   | Papier Recyclage            | France        | Paris      |
      | 099   | Nordic Paper Recovery One   | Norway        | Oslo       |

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
    Then the PRN is successfully created

    # Valid states -- Newly created PRN starts from "draft" initially
    # draft -> awaiting_authorisation, discarded
    # awaiting_authorisation -> awaiting_acceptance, deleted
    # awaiting_acceptance -> accepted, awaiting_cancellation, possibly cancelled
    # awaiting_cancellation -> cancelled
    When I update the PRN status to 'draft'
    Then I should receive a 400 error response 'No transition exists from draft to draft'

    When I update the PRN status to 'awaiting_authorisation'
    Then I should receive a 409 error response 'Insufficient available waste balance'

    When I update the PRN status to 'discarded'
    Then the PRN status is updated successfully
    And the following audit logs are present
      | Event Category  | Event Subcategory         | Event Action      | Context Keys                          | Context Values                            | Count |
      | waste-reporting | packaging-recycling-notes | status-transition | organisationId, prnId, previous, next | {{summaryLogOrgId}}, {{prnId}}, discarded | 1     |

    # Unable to transition to other PRN statuses
    When I update the PRN status to 'awaiting_authorisation'
    Then I should receive a 400 error response 'No transition exists from discarded to awaiting_authorisation'

    When I update the PRN status to 'draft'
    Then I should receive a 400 error response 'No transition exists from discarded to draft'

    # Delete a Created PRN
    When I create a PRN with the following details
      | organisationId | testId                |
      | name           | Test Organisation Ltd |
      | tradingName    | Trading Name          |
      | issuerNotes    | Testing               |
      | tonnage        | 15                    |
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
    Then I should receive a 400 error response 'No transition exists from deleted to awaiting_acceptance'

    # This time we update it with a tonnage that's below the waste balance limit
    When I create a PRN with the following details
      | organisationId | testId                |
      | name           | Test Organisation Ltd |
      | tradingName    | Trading Name          |
      | issuerNotes    | Testing               |
      | tonnage        | 25                    |
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

    When I retrieve the PRNs
    Then I see the following retrieved PRNs
    | PRN Number     | Tonnage | Material | Status    | OrganisationId | OrganisationName      | TradingName  |
    | {{prnNumber}}  | 25      | paper    | cancelled | testId         | Test Organisation Ltd | Trading Name |
    |                | 50      | paper    | discarded | testId         | Test Organisation Ltd | Trading Name |

    When an external API retrieves the PRN with status 'cancelled'
    Then the external API call to retrieve the PRN is successful and contains the PRN with PRN Number '{{prnNumber}}'

    When I update the accreditation status to 'suspended' at '2026-03-02'
    Then the organisations data update succeeds

    # We create another PRN after the accreditation is suspended
    When I create a PRN with the following details
      | organisationId | testId                |
      | name           | Test Organisation Ltd |
      | tradingName    | Trading Name          |
      | issuerNotes    | Testing               |
      | tonnage        | 5                     |
    Then the PRN is successfully created

    When I update the PRN status to 'awaiting_authorisation'
    Then the PRN status is updated successfully

    # Should not be allowed to issue PRN
    When I update the PRN status to 'awaiting_acceptance'
    Then I should receive a 403 error response 'Cannot issue a PRN on a suspended accreditation'
