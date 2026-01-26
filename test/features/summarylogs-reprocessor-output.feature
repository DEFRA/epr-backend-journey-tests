@summarylogs
@summarylogs_output
Feature: Summary Logs - Reprocessor on Output

  Background:
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType | material   |
      | Reprocessor         | Steel (R4) |

    Given I am logged in as a service maintainer
    When I update the recently migrated organisations data with the following data
      | reprocessingType | regNumber        | accNumber | status   | validFrom  |
      | output           | R25SR500050912PA | ACC500591 | approved | 2026-01-01 |
    Then the organisations data update succeeds

    When I register and authorise a User and link it to the recently migrated organisation

  Scenario: Summary Logs uploads (Reprocessor Output) and fails in-sheet revalidation
    Given I have the following summary log upload data for summary log upload
      | s3Bucket            | re-ex-summary-logs                 |
      | s3Key               | reprocessor-output-invalid-key     |
      | fileId              | reprocessor-output-invalid-file-id |
      | filename            | reprocessor-output-invalid.xlsx    |
      | fileStatus          | complete                           |
      | accreditationNumber | ACC500591                          |
      | registrationNumber  | R25SR500050912PA                   |

    When I initiate the summary log upload
    Then the summary log upload initiation succeeds
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response

    When I check for the summary log status
    Then I should see the following summary log response
      | status | invalid |
    And I should see the following summary log validation failures
      | Code               | Location Sheet                  | Location Table    | Location Row | Location Header                        | Actual     |
      | INVALID_DATE       | Reprocessed (sections 3 and 4)  | REPROCESSED_LOADS | 4            | DATE_LOAD_LEFT_SITE                    | 30-06-2025 |
      | VALUE_OUT_OF_RANGE | Reprocessed (sections 3 and 4)  | REPROCESSED_LOADS | 4            | PRODUCT_TONNAGE                        | 1005       |
      | VALUE_OUT_OF_RANGE | Reprocessed (sections 3 and 4)  | REPROCESSED_LOADS | 4            | UK_PACKAGING_WEIGHT_PERCENTAGE         | 1.1        |
      | INVALID_TYPE       | Reprocessed (sections 3 and 4)  | REPROCESSED_LOADS | 4            | ADD_PRODUCT_WEIGHT                     | Invalid    |
      | VALUE_OUT_OF_RANGE | Reprocessed (sections 3 and 4)  | REPROCESSED_LOADS | 4            | PRODUCT_UK_PACKAGING_WEIGHT_PROPORTION | 1105.5     |
    When I submit the uploaded summary log
    Then I should receive a 409 error response 'Summary log must be validated before submission. Current status: invalid'

    @reproOutput
  Scenario: Summary Logs uploads (Reprocessor Output) and succeeds, with waste balance calculated for Sent On
    Given I have the following summary log upload data for summary log upload
      | s3Bucket            | re-ex-summary-logs               |
      | s3Key               | reprocessor-output-valid-key     |
      | fileId              | reprocessor-output-valid-file-id |
      | filename            | reprocessor-output-valid.xlsx    |
      | fileStatus          | complete                         |
      | accreditationNumber | ACC500591                        |
      | registrationNumber  | R25SR500050912PA                 |
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response
    And the summary log submission status is 'validated'
    And the summary log has the following loads
      | LoadType       | Count | RowIDs                        |
      | added.valid    | 6     | 1000,1001,1002,3000,5000,5001 |
      | added.invalid  | 0     |                               |
      | added.included | 1     | 3000                          |
      | added.excluded | 5     | 1000,1001,1002,5000,5001      |
    When I submit the uploaded summary log
    Then the summary log submission succeeds
    And the summary log submission status is 'submitted'
    And I should see that waste records are created in the database with the following values
      | OrganisationId      | RegistrationId       | RowId | Type      |
      | {{summaryLogOrgId}} | {{summaryLogRegId}}  | 1000  | received  |
      | {{summaryLogOrgId}} | {{summaryLogRegId}}  | 1001  | received  |
      | {{summaryLogOrgId}} | {{summaryLogRegId}}  | 1002  | received  |
      | {{summaryLogOrgId}} | {{summaryLogRegId}}  | 3000  | processed |
      | {{summaryLogOrgId}} | {{summaryLogRegId}}  | 5000  | sentOn    |
      | {{summaryLogOrgId}} | {{summaryLogRegId}}  | 5001  | sentOn    |
    And I should see that waste balances are created in the database with the following values
      | OrganisationId      | AccreditationId     | Amount | AvailableAmount |
      | {{summaryLogOrgId}} | {{summaryLogAccId}} | 3      | 3               |

    Given I have organisation and registration details for summary log upload
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds

    When I upload the file 'reprocessor-output-adjustments.xlsx' via the CDP uploader
    Then the upload to CDP uploader succeeds

    When I submit the summary log upload completed with the response from CDP Uploader
    Then I should receive a summary log upload accepted response

    When I check for the summary log status
    Then I should see the following summary log response
      | status | validated |
    # RowIDs with 3001, 1003, 5002 are filtered from waste balance as they don't fall within the validFrom date range
    # RowID with 3000 is also adjusted
    And the summary log has the following loads
      | LoadType           | Count | RowIDs                   |
      | added.valid        | 1     | 3002                     |
      | added.invalid      | 0     |                          |
      | added.included     | 1     | 3002                     |
      | added.excluded     | 0     |                          |
      | unchanged.valid    | 5     | 1000,1001,1002,5000,5001 |
      | unchanged.invalid  | 0     |                          |
      | unchanged.included | 0     |                          |
      | unchanged.excluded | 5     | 1000,1001,1002,5000,5001 |
      | adjusted.valid     | 1     | 3000                     |
      | adjusted.invalid   | 0     |                          |
      | adjusted.included  | 1     | 3000                     |
      | adjusted.excluded  | 0     |                          |
    When I submit the uploaded summary log
    Then the summary log submission succeeds
    And the summary log submission status is 'submitted'
    And I should see that waste records are updated in the database with the following values
      | OrganisationId      | RegistrationId       | RowId | Type      |
      | {{summaryLogOrgId}} | {{summaryLogRegId}}  | 1000  | received  |
      | {{summaryLogOrgId}} | {{summaryLogRegId}}  | 1001  | received  |
      | {{summaryLogOrgId}} | {{summaryLogRegId}}  | 1002  | received  |
      | {{summaryLogOrgId}} | {{summaryLogRegId}}  | 1003  | received  |
      | {{summaryLogOrgId}} | {{summaryLogRegId}}  | 3000  | processed |
      | {{summaryLogOrgId}} | {{summaryLogRegId}}  | 3001  | processed |
      | {{summaryLogOrgId}} | {{summaryLogRegId}}  | 3002  | processed |
      | {{summaryLogOrgId}} | {{summaryLogRegId}}  | 5000  | sentOn    |
      | {{summaryLogOrgId}} | {{summaryLogRegId}}  | 5001  | sentOn    |
      | {{summaryLogOrgId}} | {{summaryLogRegId}}  | 5002  | sentOn    |
    And I should see that waste balances are created in the database with the following values
      | OrganisationId      | AccreditationId     | Amount | AvailableAmount |
      | {{summaryLogOrgId}} | {{summaryLogAccId}} | 9.25   | 9.25            |
