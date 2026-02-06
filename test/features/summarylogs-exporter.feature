@summarylogs
@summarylogs_exporter
Feature: Summary Logs - Exporter

  Scenario: Summary Logs uploads (Exporter) and fails in-sheet revalidation
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType |
      | Exporter            |

    Given I am logged in as a service maintainer
    When I update the recently migrated organisations data with the following data
      | regNumber        | accNumber | status   |
      | E25SR500030913PA | ACC234567 | approved |
    Then the organisations data update succeeds

    When I register and authorise a User and link it to the recently migrated organisation

    Given I have the following summary log upload data for summary log upload
      | s3Bucket            | re-ex-summary-logs       |
      | s3Key               | exporter-invalid-key     |
      | fileId              | exporter-invalid-file-id |
      | filename            | exporter-invalid.xlsx    |
      | fileStatus          | complete                 |
      | accreditationNumber | ACC234567                |
      | registrationNumber  | E25SR500030913PA         |

    When I initiate the summary log upload
    Then the summary log upload initiation succeeds
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response

    When I check for the summary log status
    Then I should see the following summary log response
      | status | invalid |
    And I should see the following summary log validation failures
      | Code               | Location Sheet                 | Location Table            | Location Row | Location Header                             | Actual                                                                                                             |
      | INVALID_DATE       | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | DATE_OF_EXPORT                              | TBC                                                                                                                |
      | VALUE_OUT_OF_RANGE | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | CONTAINER_NUMBER                            | ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789098765432101234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789098765432101234567890 |
      | VALUE_OUT_OF_RANGE | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | CUSTOMS_CODES                               | ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789098765432101234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789098765432101234567890 |
      | VALUE_OUT_OF_RANGE | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | TONNAGE_OF_UK_PACKAGING_WASTE_EXPORTED      | 1002                                                                                                               |
      | VALUE_OUT_OF_RANGE | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | WEIGHT_OF_NON_TARGET_MATERIALS              | 1005                                                                                                               |
      | VALUE_OUT_OF_RANGE | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | RECYCLABLE_PROPORTION_PERCENTAGE            | 1.1                                                                                                                |
      | INVALID_TYPE       | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | DID_WASTE_PASS_THROUGH_AN_INTERIM_SITE      | notValid                                                                                                           |
      | INVALID_TYPE       | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | EWC_CODE                                    | Invalid EWC                                                                                                        |
      | INVALID_TYPE       | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | BASEL_EXPORT_CODE                           | NotABasel                                                                                                          |
      | INVALID_TYPE       | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | BAILING_WIRE_PROTOCOL                       | Invalid                                                                                                            |
      | INVALID_TYPE       | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | DESCRIPTION_WASTE                           | WrongDesc                                                                                                          |
      | VALUE_OUT_OF_RANGE | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | GROSS_WEIGHT                                | 1010                                                                                                               |
      | VALUE_OUT_OF_RANGE | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | NET_WEIGHT                                  | -50                                                                                                                |
      | VALUE_OUT_OF_RANGE | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | TARE_WEIGHT                                 | -10                                                                                                                |
      | VALUE_OUT_OF_RANGE | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | PALLET_WEIGHT                               | -50                                                                                                                |
      | INVALID_TYPE       | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | OSR_ID                                      | 98A                                                                                                                |
      | INVALID_DATE       | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | DATE_RECEIVED_BY_OSR                        | 30-02-2025                                                                                                         |
      | INVALID_DATE       | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | DATE_RECEIVED_FOR_EXPORT                    | ????                                                                                                               |
      | INVALID_TYPE       | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | WERE_PRN_OR_PERN_ISSUED_ON_THIS_WASTE       | Unknown                                                                                                            |
      | INVALID_TYPE       | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | HOW_DID_YOU_CALCULATE_RECYCLABLE_PROPORTION | Invalid                                                                                                            |
      | VALUE_OUT_OF_RANGE | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | TONNAGE_RECEIVED_FOR_EXPORT                 | -1160.5                                                                                                            |
    When I submit the uploaded summary log
    Then I should receive a 409 error response 'Summary log must be validated before submission. Current status: invalid'

  ###
  # RowId 1002 has 2025-01-01 date, so it's not factored into Waste Balance calculations
  # as Accreditation is valid from 2025-02-02
  # RowId 1003 is within the valid date, but does not have all mandatory fields completed so won't be factored in waste balance calculations
  Scenario: Summary Logs uploads (Exporter) and succeeds, with waste balance calculated
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType |
      | Exporter            |

    Given I am logged in as a service maintainer
    When I update the recently migrated organisations data with the following data
      | regNumber        | accNumber | status   | validFrom  |
      | E25SR500030913PA | ACC234567 | approved | 2025-02-02 |
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
    And the summary log has the following loads
      | LoadType       | Count | RowIDs         |
      | added.valid    | 3     | 1000,1001,4000 |
      | added.invalid  | 1     | 1003           |
      | added.included | 3     | 1000,1001,4000 |
      | added.excluded | 1     | 1003           |
    When I submit the uploaded summary log
    Then the summary log submission succeeds
    And the summary log submission status is 'submitted'
    And I should see that waste records are created in the database with the following values
      | OrganisationId      | RegistrationId       | RowId | Type      |
      | {{summaryLogOrgId}} | {{summaryLogRegId}}  | 1000  | exported  |
      | {{summaryLogOrgId}} | {{summaryLogRegId}}  | 1001  | exported  |
      | {{summaryLogOrgId}} | {{summaryLogRegId}}  | 1002  | exported  |
      | {{summaryLogOrgId}} | {{summaryLogRegId}}  | 1003  | exported  |
      | {{summaryLogOrgId}} | {{summaryLogRegId}}  | 4000  | sentOn    |
    And I should see that waste balances are created in the database with the following values
      | OrganisationId      | AccreditationId     | Amount | AvailableAmount |
      | {{summaryLogOrgId}} | {{summaryLogAccId}} | 30     | 30              |
    When I retrieve the waste balance for the organisation
    Then I should see the following waste balance
      | AccreditationId     | Amount | AvailableAmount |
      | {{summaryLogAccId}} | 30     | 30              |


    Given I have the following summary log upload data for summary log upload
      | s3Bucket            | re-ex-summary-logs           |
      | s3Key               | exporter-adjustments-key     |
      | fileId              | exporter-adjustments-file-id |
      | filename            | exporter-adjustments.xlsx    |
      | fileStatus          | complete                     |
      | accreditationNumber | ACC234567                    |
      | registrationNumber  | E25SR500030913PA             |
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response
    And the summary log submission status is 'validated'

    And the summary log has the following loads
      | LoadType           | Count | RowIDs    |
      | added.valid        | 2     | 1004,4001 |
      | added.invalid      | 0     |           |
      | added.included     | 2     | 1004,4001 |
      | added.excluded     | 0     |           |
      | unchanged.valid    | 2     | 1000,4000 |
      | unchanged.invalid  | 0     |           |
      | unchanged.included | 2     | 1000,4000 |
      | unchanged.excluded | 0     |           |
      | adjusted.valid     | 1     | 1001      |
      | adjusted.invalid   | 0     |           |
      | adjusted.included  | 1     | 1001      |
      | adjusted.excluded  | 0     |           |
    When I submit the uploaded summary log
    Then the summary log submission succeeds
    And the summary log submission status is 'submitted'
    And I should see that waste records are updated in the database with the following values
      | OrganisationId      | RegistrationId       | RowId | Type      |
      | {{summaryLogOrgId}} | {{summaryLogRegId}}  | 1000  | exported  |
      | {{summaryLogOrgId}} | {{summaryLogRegId}}  | 1001  | exported  |
      | {{summaryLogOrgId}} | {{summaryLogRegId}}  | 1002  | exported  |
      | {{summaryLogOrgId}} | {{summaryLogRegId}}  | 1003  | exported  |
      | {{summaryLogOrgId}} | {{summaryLogRegId}}  | 1004  | exported  |
      | {{summaryLogOrgId}} | {{summaryLogRegId}}  | 4000  | sentOn    |
      | {{summaryLogOrgId}} | {{summaryLogRegId}}  | 4001  | sentOn    |
    And I should see that waste balances are created in the database with the following values
      | OrganisationId      | AccreditationId     | Amount | AvailableAmount |
      | {{summaryLogOrgId}} | {{summaryLogAccId}} | 89     | 89              |
    When I retrieve the waste balance for the organisation
    Then I should see the following waste balance
      | AccreditationId     | Amount | AvailableAmount |
      | {{summaryLogAccId}} | 89     | 89              |
