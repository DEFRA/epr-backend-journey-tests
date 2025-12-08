import { Given, Then, When } from '@cucumber/cucumber'
import { baseAPI, dbClient } from '../support/hooks.js'
import { SummaryLog } from '../support/generator.js'
import { expect } from 'chai'
import logger from '../support/logger.js'
import fs from 'node:fs'

Given('I have the following summary log upload data', function (dataTable) {
  this.summaryLog = new SummaryLog()
  this.uploadData = dataTable.rowsHash()
  this.payload = this.summaryLog.toUploadCompletedPayload(this.uploadData)
})

Given(
  'I update the organisations data for id {string} with the following payload {string}',
  function (orgId, pathToFile) {
    if (!process.env.ENVIRONMENT) {
      const data = JSON.parse(fs.readFileSync(pathToFile, 'utf8'))
      baseAPI.patch(`/v1/dev/organisations/${orgId}`, JSON.stringify(data))
    }
  }
)

Given(
  'I have the following summary log upload data with a valid organisation and registration details',
  function (dataTable) {
    this.summaryLog = new SummaryLog()
    this.summaryLog.orgId = '6507f1f77bcf86cd79943911'
    this.summaryLog.regId = '6507f1f77bcf86cd79943912'
    this.uploadData = dataTable.rowsHash()
    this.payload = this.summaryLog.toUploadCompletedPayload(this.uploadData)
  }
)

When('the summary log upload data is updated', function (dataTable) {
  this.uploadData = dataTable.rowsHash()
  this.payload = this.summaryLog.toUploadCompletedPayload(this.uploadData)
})

When('I submit the summary log upload completed', async function () {
  const summaryLogId = this.summaryLog.summaryLogId
  this.response = await baseAPI.post(
    `/v1/organisations/${this.summaryLog.orgId}/registrations/${this.summaryLog.regId}/summary-logs/${summaryLogId}/upload-completed`,
    JSON.stringify(this.payload)
  )
})

When('I initiate the summary log upload', async function () {
  this.initiatePayload = {
    redirectUrl: 'summary-log-upload-redirect'
  }
  this.response = await baseAPI.post(
    `/v1/organisations/${this.summaryLog.orgId}/registrations/${this.summaryLog.regId}/summary-logs`,
    JSON.stringify(this.initiatePayload)
  )
})

Then('the summary log upload initiation succeeds', async function () {
  expect(this.response.statusCode).to.equal(201)
  this.responseData = await this.response.body.json()
  this.summaryLog.summaryLogId = this.responseData.summaryLogId
})

When(
  'I check for the summary log status',
  { timeout: 10000 },
  async function () {
    const summaryLogId = this.summaryLog.summaryLogId
    const url = `/v1/organisations/${this.summaryLog.orgId}/registrations/${this.summaryLog.regId}/summary-logs/${summaryLogId}`

    // Transient statuses that indicate processing is still in progress
    const transientStatuses = ['preprocessing', 'validating']
    const timeout = 10000 // 10 seconds
    const interval = 500 // 500ms between polls
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      this.response = await baseAPI.get(url)

      // If the response is not 200, stop polling and return the error response
      if (this.response.statusCode !== 200) {
        return
      }

      // Parse response to check status
      const responseData = await this.response.body.json()
      const currentStatus = responseData.status

      // If status is stable (not transient), we're done
      if (!transientStatuses.includes(currentStatus)) {
        logger.info(
          {
            summaryLogId,
            status: currentStatus,
            elapsedMs: Date.now() - startTime
          },
          'Summary log validation completed'
        )
        // Store response data for later assertions since body can only be read once
        this.responseData = responseData
        return
      }

      // Status is still transient, wait before polling again
      logger.debug(
        {
          summaryLogId,
          status: currentStatus,
          elapsedMs: Date.now() - startTime
        },
        'Summary log validation in progress, waiting...'
      )

      await new Promise((resolve) => setTimeout(resolve, interval))
    }

    // Timeout reached - make one final request and store the response
    this.response = await baseAPI.get(url)
    if (this.response.statusCode === 200) {
      this.responseData = await this.response.body.json()
    }

    logger.warn(
      {
        summaryLogId,
        timeout,
        status: this.responseData?.status,
        elapsedMs: Date.now() - startTime
      },
      'Timeout waiting for summary log validation to complete'
    )
  }
)

When('I submit the uploaded summary log', async function () {
  const summaryLogId = this.summaryLog.summaryLogId
  this.response = await baseAPI.post(
    `/v1/organisations/${this.summaryLog.orgId}/registrations/${this.summaryLog.regId}/summary-logs/${summaryLogId}/submit`
  )
})

Then('the summary log submission succeeds', async function () {
  if (!process.env.ENVIRONMENT) {
    expect(this.response.statusCode).to.equal(200)
  } else {
    logger.warn(
      {
        step_definition: 'Then the summary log submission succeeds'
      },
      'Skipping summary log submission checks'
    )
  }
})

Then(
  'I should receive a summary log upload accepted response',
  async function () {
    expect(this.response.statusCode).to.equal(202)
  }
)

Then(
  'I should see the following summary log response',
  async function (dataTable) {
    const expectedResults = dataTable.rowsHash()
    expect(this.response.statusCode).to.equal(200)

    // Only check the status in local runs as environment runs will not have the file uploaded to S3
    if (!process.env.ENVIRONMENT) {
      // responseData is already parsed in the status check step
      if (!this.responseData) {
        this.responseData = await this.response.body.json()
      }
      expect(this.responseData.status).to.equal(expectedResults.status)
    }
  }
)

Then(
  'I should see the following summary log validation failures',
  async function (dataTable) {
    // Only check the status in local runs as environment runs will not have the file uploaded to S3
    if (process.env.ENVIRONMENT) {
      logger.warn(
        {
          step_definition:
            'Then I should see the following summary log validation failures'
        },
        'Skipping summary log validation failure checks'
      )
      return
    }

    const expectedResults = dataTable.hashes()
    expect(this.responseData.validation.failures.length).to.equal(
      expectedResults.length
    )

    for (const expectedResult of expectedResults) {
      const matchingFailure = this.responseData.validation.failures.find(
        (failure) => {
          const checks = [
            ['Code', 'code'],
            ['Location Field', 'location.field'],
            ['Location Sheet', 'location.sheet'],
            ['Location Table', 'location.table'],
            ['Location Row ID', 'location.rowId'],
            ['Location Row', 'location.row'],
            ['Actual', 'actual']
          ]

          return checks.every(([expectedKey, actual]) => {
            if (expectedResult[expectedKey] === undefined) return true

            const actualValue = actual.includes('.')
              ? actual.split('.').reduce((obj, key) => obj?.[key], failure)
              : failure[actual]
            return `${actualValue}` === expectedResult[expectedKey]
          })
        }
      )

      if (!matchingFailure) {
        expect.fail(
          `Expected validation ${JSON.stringify(expectedResult)} but no failures found with those values. Actual validation values found: ${JSON.stringify(this.responseData.validation)}`
        )
      }
    }
  }
)

Then(
  'I should see the following summary log validation concerns for table {string}, row {int} and sheet {string}',
  async function (expectedTable, expectedRow, expectedSheet, dataTable) {
    // Only check the status in local runs as environment runs will not have the file uploaded to S3
    if (process.env.ENVIRONMENT) {
      logger.warn(
        {
          step_definition:
            'Then I should see the following summary log validation concerns'
        },
        'Skipping summary log validation concerns checks'
      )
      return
    }

    const expectedResults = dataTable.hashes()
    // eslint-disable-next-line no-unused-expressions
    expect(this.responseData.validation.concerns[expectedTable]).to.not.be
      .undefined

    for (const expectedResult of expectedResults) {
      const matchingRow = this.responseData.validation.concerns[
        expectedTable
      ].rows.find((actualRow) => {
        return expectedRow === actualRow.row
      })

      if (matchingRow.length === 0) {
        expect.fail(
          `Expected row ${expectedRow} but no row found with those values. Actual row values found: ${JSON.stringify(this.responseData.validation.concerns[expectedTable].rows.map((actualRow) => actualRow.row))}`
        )
      }

      const matchingConcern = matchingRow.issues.find((issue) => {
        const checks = [
          ['Type', 'type'],
          ['Code', 'code'],
          ['Header', 'header'],
          ['Column', 'column'],
          ['Actual', 'actual']
        ]

        return checks.every(([expectedKey, actual]) => {
          if (expectedResult[expectedKey] === undefined) return true

          const actualValue = actual.includes('.')
            ? actual.split('.').reduce((obj, key) => obj?.[key], issue)
            : issue[actual]
          return actualValue === expectedResult[expectedKey]
        })
      })

      if (!matchingConcern) {
        expect.fail(
          `Expected validation ${JSON.stringify(expectedResult)} but no concerns found with those values. Actual validation concern values found: ${JSON.stringify(this.responseData.validation.concerns)}`
        )
      }
    }
  }
)

Then(
  'I should see that a summary log is created in the database with the following values',
  async function (dataTable) {
    if (!process.env.ENVIRONMENT) {
      const expectedSummaryLog = dataTable.rowsHash()
      const summaryLogCollection = dbClient.collection('summary-logs')
      const summaryLog = await summaryLogCollection.findOne({
        _id: this.summaryLog.summaryLogId
      })
      expect(summaryLog._id).to.equal(this.summaryLog.summaryLogId)
      expect(summaryLog.file.id).to.equal(expectedSummaryLog.fileId)
      expect(summaryLog.file.name).to.equal(expectedSummaryLog.filename)
      expect(summaryLog.file.status).to.equal(expectedSummaryLog.fileStatus)
      expect(summaryLog.status).to.equal(expectedSummaryLog.status)
      switch (expectedSummaryLog.fileStatus) {
        case 'complete':
          expect(summaryLog.file.uri).to.equal(
            `s3://${expectedSummaryLog.s3Bucket}/${expectedSummaryLog.s3Key}`
          )
          break
        case 'rejected':
          expect(summaryLog.validation.failures[0].code).to.equal(
            expectedSummaryLog.validationFailure
          )
          break
      }
    } else {
      logger.warn(
        {
          step_definition:
            'Then I should see that a summary log is created in the database with the following values'
        },
        'Skipping summary log database checks'
      )
    }
  }
)

Then(
  'I should see that waste records are created in the database with the following values',
  async function (dataTable) {
    if (!process.env.ENVIRONMENT) {
      const wasteRecordsCollection = dbClient.collection('waste-records')
      const wasteRecords = await wasteRecordsCollection
        .find({
          organisationId: '6507f1f77bcf86cd79943911'
        })
        .toArray()

      const expectedWasteRecords = dataTable.hashes()
      expect(wasteRecords.length).to.equal(expectedWasteRecords.length)

      for (const expectedWasteRecord of expectedWasteRecords) {
        const matchingRecord = wasteRecords.find(
          (record) =>
            record.organisationId === expectedWasteRecord.OrganisationId &&
            record.registrationId === expectedWasteRecord.RegistrationId &&
            record.rowId === parseInt(expectedWasteRecord.RowId) &&
            record.type === expectedWasteRecord.Type
        )

        if (!matchingRecord) {
          expect.fail(
            `Expected record: ${JSON.stringify(expectedWasteRecord)}, but no records found with those values. Actual records found: ${JSON.stringify(wasteRecords)}`
          )
        }

        const sameTimestamp = wasteRecords.every(
          (obj) =>
            obj.versions[0].createdAt === wasteRecords[0].versions[0].createdAt
        )
        expect(sameTimestamp).to.equal(
          true,
          'All waste records created on the same upload should have the same timestamp'
        )
      }
    } else {
      logger.warn(
        {
          step_definition:
            'Then I should see that waste records are created in the database with the following values'
        },
        'Skipping waste record database checks'
      )
    }
  }
)
