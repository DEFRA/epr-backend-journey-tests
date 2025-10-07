@summarylogs
Feature: Summary Logs validate endpoint

  Scenario: Ensure that Summary Logs validate endpoint returns a response
    Given I have entered my summary log validation
    When I submit the summary log validation
    Then I should receive a summary log validating response
    And the following information appears in the log
      | Log Level    | info                                                                                                           |
      | Event Action | request_success                                                                                                |
      | Message      | Initiating file validation for test-bucket/test-key with fileId: test-file-id and filename: test-filename.xlsx |

  Scenario: Summary Logs validate endpoint returns an error if s3Key is not present
    Given I have entered my summary log validation without s3Key
    When I submit the summary log validation
    Then I should receive a 422 error response 's3Key is missing in body.data'
    And the following information appears in the log
      | Log Level    | warn                          |
      | Event Action | response_failure              |
      | Message      | s3Key is missing in body.data |

  Scenario: Summary Logs validate endpoint returns an error if s3Bucket is not present
    Given I have entered my summary log validation without s3Bucket
    When I submit the summary log validation
    Then I should receive a 422 error response 's3Bucket is missing in body.data'

  Scenario: Summary Logs validate endpoint returns an error if fileId is not present
    Given I have entered my summary log validation without fileId
    When I submit the summary log validation
    Then I should receive a 422 error response 'fileId is missing in body.data'

  Scenario: Summary Logs validate endpoint returns an error if filename is not present
    Given I have entered my summary log validation without filename
    When I submit the summary log validation
    Then I should receive a 422 error response 'filename is missing in body.data'

  Scenario: Summary Logs validate endpoint returns an error if payload is not present
    Given I have not entered any details
    When I submit the summary log validation
    Then I should receive a 400 error response 'Invalid payload'
    And the following information appears in the log
      | Log Level    | warn             |
      | Event Action | response_failure |
      | Message      | Invalid payload  |

  Scenario: Summary Logs validate endpoint returns an error if payload is not a valid object
    Given I have entered invalid details
    When I submit the summary log validation
    Then I should receive a 400 error response 'Invalid payload'
