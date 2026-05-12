@localonly
@automated_scaling
Feature: Automated scaling test for Summary Logs Reprocessor on Input

  Background:
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType |
      | Reprocessor         |

    Given I am logged in as a service maintainer
    When I update the recently migrated organisations data with the following data
      | reprocessingType | regNumber        | accNumber | status   | validFrom  |
      | input            | R25SR500030912PA | ACC123456 | approved | 2025-02-02 |
    Then the organisations data update succeeds

    When I register and authorise a User and link it to the recently migrated organisation

  Scenario: Summary Logs uploads incrementally and creates Waste Records - 2k rows to start with and additional 2k rows thereafter
    When I generate the Summary Log spreadsheets and upload with the following
      | wasteProcessingType | reprocessorInput |
      | regNumber           | R25SR500030912PA |
      | accNumber           | ACC123456        |
      | numberOfRows        | 2000             |
      | materialSuffix      | PA               |
      | iterations          | 10               |
