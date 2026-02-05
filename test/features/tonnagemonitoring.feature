@tonnagemonitoring
Feature: Tonnage monitoring endpoint

  Scenario: Tonnage monitoring endpoint returns total tonnage information
    Given I am logged in as a service maintainer
    When I request the tonnage monitoring
    Then the tonnage monitoring information should be correct

