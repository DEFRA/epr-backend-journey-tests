@authentication
Feature: Authentication tests

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

  Scenario: Auth errors are logged when user tries to access a different organisation
    Given I have organisation and registration details for summary log upload
    When I try to access summary logs for organisation '6507f1f77bcf86cd79943999'
    Then I should receive a 401 error response 'Access denied: organisation mismatch'
    And the following messages appear in the log
      | Log Level | Event Action | Message                              |
      | warn      | auth_failed  | Access denied: organisation mismatch |

  Scenario: Auth errors are logged when a different user tries to link a linked organisation
    When I register and authorise a new User with email 'test123456@testuserz.com'

    When the User is linked to the recently migrated organisation
    Then I should receive a 401 error response 'user is not authorised to link organisation'
    And the following messages appear in the log
      | Log Level | Event Action | Message                                     |
      | warn      | auth_failed  | user is not authorised to link organisation |

  Scenario: Should not allow re-linking of linked organisation
    When the User is linked to the recently migrated organisation
    Then I should receive a 409 error response 'Organisation is not in an approvable state'

  Scenario: Auth errors are logged when a different user tries to access a recently linked organisation
    When I register and authorise a new User with email 'anothertest123456@testuserz.com'

    Given I have organisation and registration details for summary log upload
    When I initiate the summary log upload
    Then I should receive a 401 error response 'User is not linked to an organisation'
    And the following messages appear in the log
      | Log Level | Event Action | Message                              |
      | warn      | auth_failed  | User is not linked to an organisation |
