##TODO: WIP PRNs test
#@prn
#Feature: Packaging Recycling Notes transitions
#
#  Background: Create a PRN and transition accordingly
#    Given I create a linked and migrated organisation for the following
#      | wasteProcessingType |
#      | Exporter            |
#
#    Given I am logged in as a service maintainer
#    When I update the recently migrated organisations data with the following data
#      | regNumber        | accNumber | status   |
#      | R25SR500030912PA | ACC123456 | approved |
#    Then the organisations data update succeeds
#
#    When I register and authorise a User and link it to the recently migrated organisation
#
#    # draft -> awaiting_authorisation, cancelled
#    # awaiting_authorisation -> awaiting_acceptance, cancelled
#    # awaiting_acceptance -> accepted, rejected
#  Scenario Outline: Packaging Recycling Notes with valid state transitions after awaiting_acceptance
#
#    When I create a PRN with the following details
#        | issuedToOrganisation |  Test Organisation |
#        | tonnage              |  50                |
#        | material             |  paper             |
#        | nation               |  england           |
#        | wasteProcessingType  |  exporter          |
#        | issuerNotes          |  Testing           |
#    Then the PRN is successfully created
#
#    When I update the PRN status to 'awaiting_authorisation'
#    Then the PRN status is updated successfully
#
#    When I update the PRN status to 'awaiting_acceptance'
#    Then the PRN status is updated successfully
#
#    When I update the PRN status to '<lastStatus>'
#    Then the PRN status is updated successfully
#
#    Examples:
#      | lastStatus |
#      | accepted   |
#      | rejected   |
#
#  Scenario: Packaging Recycling Notes with invalid state transitions after creation
#
#    When I create a PRN with the following details
#        | issuedToOrganisation |  Test Organisation |
#        | tonnage              |  50                |
#        | material             |  paper             |
#        | nation               |  england           |
#        | wasteProcessingType  |  exporter          |
#        | issuerNotes          |  Testing           |
#    Then the PRN is successfully created
#
#    When I update the PRN status to 'draft'
#    Then I should receive a 400 error response 'Invalid status transition: draft -> draft'
#
#    When I update the PRN status to 'awaiting_acceptance'
#    Then I should receive a 400 error response 'Invalid status transition: draft -> awaiting_acceptance'
#
#    When I update the PRN status to 'accepted'
#    Then I should receive a 400 error response 'Invalid status transition: draft -> accepted'
#
#    When I update the PRN status to 'rejected'
#    Then I should receive a 400 error response 'Invalid status transition: draft -> rejected'
#
