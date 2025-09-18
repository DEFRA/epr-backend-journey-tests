Feature: ZAP scanner tests

  Scenario Outline: Ensure that the <EndpointName> endpoint does not return any alerts after ZAP scan
    Given the ZAP spider scan is run for the following
      | Url    | <Url>    |
      | Method | <Method> |
    When I request the ZAP active scan
    Then I should receive no alerts from the ZAP report

  Examples:
    | EndpointName  | Url                     | Method |
    | organisation  | /v1/apply/organisation  | POST   |
    | accreditation | /v1/apply/accreditation | POST   |
    | registration  | /v1/apply/registration  | POST   |
