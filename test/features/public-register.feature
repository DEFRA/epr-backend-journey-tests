@publicregister
Feature: Public register endpoint

  Scenario: Public register endpoint returns link to CSV file
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType |
      | Reprocessor         |

    Given I am logged in as a service maintainer
    When I update the recently migrated organisations data with the following data
      | reprocessingType | regNumber        | accNumber | status   |
      | input            | R25SR500030912PA | ACC123456 | approved |
    Then the organisations data update succeeds

    When I register and authorise a User and link it to the recently migrated organisation

    Given I have the following summary log upload data for summary log upload
      | s3Bucket            | re-ex-summary-logs          |
      | s3Key               | reprocessor-input-valid-key |
      | fileId              | reprocessor-file-id         |
      | filename            | reprocessor.xlsx            |
      | fileStatus          | complete                    |
      | accreditationNumber | ACC123456                   |
      | registrationNumber  | R25SR500030912PA            |
    When I initiate the summary log upload
    Then the summary log upload initiation succeeds
    When I submit the summary log upload completed
    Then I should receive a summary log upload accepted response
    And the summary log submission status is 'validated'
    When I submit the uploaded summary log
    Then the summary log submission succeeds

    When I create the report for the year 2026 and period 1
    Then the report is successfully created

    When I patch the 'monthly' report for the year 2026 and period 1 with
      | tonnageRecycled    | 100.5 |
      | tonnageNotRecycled | 20    |
      | prnRevenue         | 123.4 |
      | freeTonnage        | 0     |
    Then the report patch succeeds
    And the patched report contains the following information
      | Key                                  | Value |
      | recyclingActivity.tonnageRecycled    | 100.5 |
      | recyclingActivity.tonnageNotRecycled | 20    |
      | prn.totalRevenue                     | 123.4 |
      | prn.freeTonnage                      | 0     |

    When I update the 'monthly' report for the year 2026 and period 1 with status 'ready_to_submit' and version 2
    Then the report status is successfully updated
    When I update the 'monthly' report for the year 2026 and period 1 with status 'submitted' and version 3
    Then the report status is successfully updated

    Given I am logged in as a service maintainer
    When I request the public register
    When I retrieve the public register file
    Then I should see generated at as first row "^Generated at [0-9]{2}\.[0-9]{2}\.[0-9]{2} [0-9]{2}:[0-9]{2}"
    Then I should see the following public register information
      | Type        | Org ID        | Companies House Number | Registration number | Packaging Waste Category | Annex II Process| Accreditation No | Accreditation status | Jan Report       |
      | Reprocessor | {{formOrgId}} |                        | R25SR500030912PA    | Paper and board          | R3              | ACC123456        | Approved             | {{reportToday}}  |
    And the following audit logs are present
      | Event Category  | Event Action | Context Keys                 | Count | Context Values        |
      | public-register | generate     | url, expiresAt, generatedAt  | 1     | {{publicRegisterUrl}} |
