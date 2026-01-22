@summarylogs
@summarylogs_exporter
Feature: Summary Logs - Exporter

  Background:
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType |
      | Exporter            |

    Given I am logged in as a service maintainer
    When I update the recently migrated organisations data with the following data
      | regNumber        | accNumber | status   |
      | E25SR500030913PA | ACC234567 | approved |
    Then the organisations data update succeeds

    When I register and authorise a User and link it to the recently migrated organisation

  Scenario: Summary Logs uploads (Exporter) and fails in-sheet revalidation
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
      | INVALID_DATE       | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | DATE_OF_EXPORT                              | 22-01-2025                                                                                                         |
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
      | VALUE_OUT_OF_RANGE | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | INTERIM_SITE_ID                             | 99                                                                                                                 |
      | VALUE_OUT_OF_RANGE | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | TONNAGE_PASSED_INTERIM_SITE_RECEIVED_BY_OSR | -50                                                                                                                |
      | INVALID_TYPE       | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | OSR_ID                                      | 98A                                                                                                                |
      | INVALID_DATE       | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | DATE_RECEIVED_BY_OSR                        | 30-02-2025                                                                                                         |
      | INVALID_DATE       | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | DATE_RECEIVED_FOR_EXPORT                    | 26-06-2025                                                                                                         |
      | INVALID_TYPE       | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | WERE_PRN_OR_PERN_ISSUED_ON_THIS_WASTE       | Unknown                                                                                                            |
      | INVALID_TYPE       | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | HOW_DID_YOU_CALCULATE_RECYCLABLE_PROPORTION | Invalid                                                                                                            |
      | VALUE_OUT_OF_RANGE | Exported (sections 1, 2 and 3) | RECEIVED_LOADS_FOR_EXPORT | 4            | TONNAGE_RECEIVED_FOR_EXPORT                 | -1160.5                                                                                                            |
    When I submit the uploaded summary log
    Then I should receive a 409 error response 'Summary log must be validated before submission. Current status: invalid'

    Scenario: Summary Logs uploads (Exporter) and succeeds, with waste balance calculated
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
    And I should see that waste records are created in the database with the following values
      | OrganisationId      | RegistrationId       | RowId | Type      |
      | {{summaryLogOrgId}} | {{summaryLogRegId}}  | 1000  | exported  |
      | {{summaryLogOrgId}} | {{summaryLogRegId}}  | 1001  | exported  |
      | {{summaryLogOrgId}} | {{summaryLogRegId}}  | 4000  | sentOn    |
    And I should see that waste balances are created in the database with the following values
      | OrganisationId      | AccreditationId     | Amount | AvailableAmount |
      | {{summaryLogOrgId}} | {{summaryLogAccId}} | 30     | 30              |
