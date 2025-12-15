@zap @wip
Feature: ZAP scanner tests

  Scenario: Ensure that the root endpoint does not return any alerts after a full active ZAP scan
    Given the ZAP spider scan is run for the following
      | Url         | /        |
      | Method      | GET      |
    When I request the full ZAP active scan
    Then I should receive no alerts from the ZAP report

  Scenario Outline: Ensure that the <EndpointName> endpoint does not return any alerts after a partial ZAP scan
    Given the ZAP spider scan is run for the following
      | Url         | <Url>         |
      | Method      | <Method>      |
    When I request the partial ZAP active scan
    Then I should receive no alerts from the ZAP report

  Examples:
    | EndpointName                 | Url                                                                                     | Method |
    | organisation                 | /v1/apply/organisation                                                                  | POST   |
    | accreditation                | /v1/apply/accreditation                                                                 | POST   |
    | registration                 | /v1/apply/registration                                                                  | POST   |
    | summary log validate         | /v1/organisation/12345/registration/abcdef/summary-logs/validate                        | POST   |
    | summary log upload completed | /v1/organisation/12345/registration/abcdef/summary-logs/aaaa-bbbb-cccc/upload-completed | POST   |
    | organisations                | /v1/organisations/                                                                      | GET    |
