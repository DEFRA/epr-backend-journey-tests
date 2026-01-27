@smoketest
Feature: Public register smoke test

  Scenario: Public register endpoint returns link to CSV file

    Given I am logged in as a service maintainer
    When I request the public register
    When I retrieve the public register file
    Then the public register file should not be empty
