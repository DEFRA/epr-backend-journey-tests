@prn
@prn_reprocessor_output
Feature: Packaging Recycling Notes transitions for Reprocessors on Output

  Scenario: PRNs are created after waste balance is available for Reprocessor Output
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType | material   |
      | Reprocessor         | Steel (R4) |

    Given I am logged in as a service maintainer
    When I update the recently migrated organisations data with the following data
      | reprocessingType | regNumber        | accNumber | status   | validFrom  | submittedToRegulator |
      | output           | R25SR500050912PA | ACC500591 | approved | 2026-01-01 | nrw                  |
    Then the organisations data update succeeds

    When I register and authorise a User and link it to the recently migrated organisation

    Given I have the following summary log upload data for summary log upload
      | s3Bucket   | re-ex-summary-logs               |
      | s3Key      | reprocessor-output-valid-key     |
      | fileId     | reprocessor-output-valid-file-id |
      | filename   | reprocessor-output-valid.xlsx    |
      | fileStatus | complete                         |
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response
    And the summary log submission status is 'validated'
    When I submit the uploaded summary log
    Then the summary log submission succeeds
    And the summary log submission status is 'submitted'

    # Waste balance of 3, we are attempting 2, which will be ok
    When I create a PRN with the following details
      | organisationId | testId                |
      | name           | Test Organisation Ltd |
      | tradingName    | Trading Name          |
      | issuerNotes    | Testing               |
      | tonnage        | 2                     |
      | material       | paper                 |
    Then the PRN is successfully created

    When I update the PRN status to 'awaiting_authorisation'
    Then the PRN status is updated successfully
    And the following audit logs are present
      | Event Category  | Event Subcategory         | Event Action      | Context Keys                          | Context Values                                         | Count |
      | waste-reporting | packaging-recycling-notes | status-transition | organisationId, prnId, previous, next | {{summaryLogOrgId}}, {{prnId}}, awaiting_authorisation | 1     |

    When I update the PRN status to 'awaiting_acceptance'
    Then the PRN is issued successfully
    # WR because W for NRW, and R for Reprocessor
    And the PRN number starts with 'WR'
    And the following audit logs are present
      | Event Category  | Event Subcategory         | Event Action      | Context Keys                          | Context Values                                      | Count |
      | waste-reporting | packaging-recycling-notes | status-transition | organisationId, prnId, previous, next | {{summaryLogOrgId}}, {{prnId}}, awaiting_acceptance | 1     |

