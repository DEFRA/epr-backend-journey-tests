@prn
@prn_reprocessor_input
Feature: Packaging Recycling Notes transitions for Reprocessors on Input

  Scenario: PRNs are created after waste balance is available for Reprocessor Input
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType |
      | Reprocessor         |

    Given I am logged in as a service maintainer
    When I update the recently migrated organisations data with the following data
      | reprocessingType | regNumber        | accNumber | status   | submittedToRegulator |
      | input            | R25SR500030912PA | ACC123456 | approved | sepa                 |
    Then the organisations data update succeeds

    When I register and authorise a User and link it to the recently migrated organisation

    Given I have the following summary log upload data for summary log upload
      | s3Bucket   | re-ex-summary-logs              |
      | s3Key      | reprocessor-input-valid-key     |
      | fileId     | reprocessor-input-valid-file-id |
      | filename   | reprocessor-input-valid.xlsx    |
      | fileStatus | complete                        |
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response
    And the summary log submission status is 'validated'
    When I submit the uploaded summary log
    Then the summary log submission succeeds
    And the summary log submission status is 'submitted'

    # Waste balance of 361.62, we are attempting 50, which will be ok
    When I create a PRN with the following details
      | organisationId | testId                |
      | name           | Test Organisation Ltd |
      | tradingName    | Trading Name          |
      | issuerNotes    | Testing               |
      | tonnage        | 50                    |
    Then the PRN is successfully created

    When I update the PRN status to 'awaiting_authorisation'
    Then the PRN status is updated successfully
    And the following audit logs are present
      | Event Category  | Event Subcategory         | Event Action      | Context Keys                          | Context Values                                         | Count |
      | waste-reporting | packaging-recycling-notes | status-transition | organisationId, prnId, previous, next | {{summaryLogOrgId}}, {{prnId}}, awaiting_authorisation | 1     |

    When I update the PRN status to 'awaiting_acceptance'
    Then the PRN is issued successfully
    # SR because S for SEPA, and R for Reprocessor
    And the PRN number starts with 'SR'
    And the following audit logs are present
      | Event Category  | Event Subcategory         | Event Action      | Context Keys                          | Context Values                                      | Count |
      | waste-reporting | packaging-recycling-notes | status-transition | organisationId, prnId, previous, next | {{summaryLogOrgId}}, {{prnId}}, awaiting_acceptance | 1     |

  #TODO: Re-visit Cognito stub
#    # External API from RPD
#    When an external API accepts the PRN
#    Then the external API call to update the PRN status is successful
#    # Acceptance shifts the PRN to accepted status
#    And the following audit logs are present
#      | Event Category  | Event Subcategory         | Event Action      | Context Keys                          | Context Values                           | Count |
#      | waste-reporting | packaging-recycling-notes | status-transition | organisationId, prnId, previous, next | {{summaryLogOrgId}}, {{prnId}}, accepted | 1     |
#
#    When an external API accepts the PRN
#    Then I should receive a 409 error response 'No transition exists from accepted to accepted'
