@systemLogsReconciliation
Feature: System logs - Defra ID reconciliation

  Background:
    Given I create a linked and migrated organisation for the following
      | wasteProcessingType |
      | Reprocessor         |

    Given I am logged in as a service maintainer
    When I update the recently migrated organisations data with the following data
      | reprocessingType | regNumber        | accNumber | status   |
      | input            | R25SR500030912PA | ACC123456 | approved |
    Then the organisations data update succeeds

    When I register and authorise a User and link it to the recently migrated organisation

  Scenario: Reconciliation system log is created when user discovers organisations
    When the user discovers their organisations
    Then the response status code is 200
    When I search system logs for the user's email with sub-category 'defra-id-reconciliation'
    Then I receive exactly 1 system log
    And the system log event action is 'organisations-discovered'
    And the system log context includes a linked organisation
