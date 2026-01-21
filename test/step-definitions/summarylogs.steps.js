import { Given, Then, When } from '@cucumber/cucumber'
import {
  baseAPI,
  dbClient,
  defraIdStub,
  cdpUploader
} from '../support/hooks.js'
import { SummaryLog } from '../support/generator.js'
import { expect } from 'chai'
import logger from '../support/logger.js'
import fs from 'node:fs'
import { Dates } from '../support/dates.js'

const interval = process.env.ENVIRONMENT ? 2000 : 500
const pollTimeout = process.env.ENVIRONMENT ? 60000 : 30000

Given('I have the following summary log upload data', function (dataTable) {
  this.summaryLog = new SummaryLog()
  this.uploadData = dataTable.rowsHash()
  this.summaryLog.setUploadData(this.uploadData)
  this.payload = this.summaryLog.toUploadCompletedPayload()
})

Given(
  'I update the organisations data with the following data',
  async function (dataTable) {
    const updateDataRows = dataTable.hashes()

    const currentYear = new Date().getFullYear()

    let data = this.responseData

    for (let i = 0; i < updateDataRows.length; i++) {
      const orgUpdateData = updateDataRows[i]
      data.registrations[i].status = orgUpdateData.status
      data.registrations[i].validFrom = '2025-01-01'
      data.registrations[i].validTo = `${currentYear + 1}-01-01`
      data.registrations[i].reprocessingType = orgUpdateData.reprocessingType
      data.registrations[i].registrationNumber = orgUpdateData.regNumber
      data.accreditations[i].status = orgUpdateData.status
      data.accreditations[i].validFrom = '2025-01-01'
      data.accreditations[i].validTo = `${currentYear + 1}-01-01`
      data.accreditations[i].reprocessingType = orgUpdateData.reprocessingType
      data.accreditations[i].accreditationNumber = orgUpdateData.accNumber
    }
    this.email = data.submitterContactDetails.email

    data.status = updateDataRows[0].status

    const orgId = this.orgResponseData?.referenceNumber

    this.registrationId = data.registrations[0].id
    this.accreditationId = data.accreditations[0].id
    this.organisationId = orgId

    data = { organisation: data }

    this.response = await baseAPI.patch(
      `/v1/dev/organisations/${orgId}`,
      JSON.stringify(data)
    )
  }
)

Given(
  'I update the organisations data for id {string} with the following payload {string}',
  async function (orgId, pathToFile) {
    if (!process.env.ENVIRONMENT) {
      if (defraIdStub.processedOrgs.get(orgId) !== pathToFile) {
        const data = JSON.parse(fs.readFileSync(pathToFile, 'utf8'))
        const dates = new Dates()
        dates.updateValidDates(data)

        this.response = await baseAPI.patch(
          `/v1/dev/organisations/${orgId}`,
          JSON.stringify(data)
        )

        defraIdStub.processedOrgs.set(orgId, pathToFile)
      } else {
        this.response = { statusCode: 200 }
      }
    } else {
      logger.warn(
        {
          step_definition: `Given I update the organisations data for id ${orgId} with the following payload ${pathToFile}`
        },
        'Skipping organisations data update'
      )
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
    this.summaryLog.setUploadData(this.uploadData)
    this.payload = this.summaryLog.toUploadCompletedPayload()
    if (this.uploadData.processingType === 'exporter') {
      this.summaryLog.regId = '6507f1f77bcf86cd79943913'
    } else if (
      this.uploadData.processingType === 'reprocessorOutput-exporter'
    ) {
      this.summaryLog.orgId = '6507f1f77bcf86cd79943931'
      this.summaryLog.regId = '6507f1f77bcf86cd79943932'
    }
  }
)

Given(
  'I have valid organisation and registration details for summary log upload with waste processing type {string}',
  function (processingType) {
    this.summaryLog = new SummaryLog()
    this.summaryLog.orgId = '6507f1f77bcf86cd79943911'
    this.summaryLog.regId = '6507f1f77bcf86cd79943912'
    if (processingType === 'exporter') {
      this.summaryLog.regId = '6507f1f77bcf86cd79943913'
    } else if (processingType === 'reprocessorOutput-exporter') {
      this.summaryLog.orgId = '6507f1f77bcf86cd79943931'
      this.summaryLog.regId = '6507f1f77bcf86cd79943932'
    }
  }
)

Given(
  'I have organisation and registration details for summary log upload',
  function () {
    this.summaryLog = new SummaryLog()
    this.summaryLog.orgId = this.organisationId
    this.summaryLog.regId = this.registrationId
  }
)

When('the summary log upload data is updated', function (dataTable) {
  this.uploadData = dataTable.rowsHash()
  this.summaryLog.setUploadData(this.uploadData)
  this.payload = this.summaryLog.toUploadCompletedPayload()
})

When('I submit the summary log upload completed', async function () {
  const summaryLogId = this.summaryLog.summaryLogId
  this.response = await baseAPI.post(
    `/v1/organisations/${this.summaryLog.orgId}/registrations/${this.summaryLog.regId}/summary-logs/${summaryLogId}/upload-completed`,
    JSON.stringify(this.payload)
  )
})

When(
  'I submit the summary log upload completed with the response from CDP Uploader',
  async function () {
    const timeout = pollTimeout
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      this.response = await cdpUploader.status(this.uploadId)

      this.responseData = await this.response.body.json()
      const fileStatus = this.responseData.form?.file?.fileStatus
      if (fileStatus === 'complete') {
        break
      }

      await new Promise((resolve) => setTimeout(resolve, interval))
    }

    this.summaryLog.setFileData(
      this.responseData.form.file.s3Bucket,
      this.responseData.form.file.s3Key,
      this.responseData.form.file.fileId,
      this.responseData.form.file.filename,
      this.responseData.form.file.fileStatus
    )

    this.payload = this.summaryLog.toUploadCompletedPayload()

    this.response = await baseAPI.post(
      `/v1/organisations/${this.summaryLog.orgId}/registrations/${this.summaryLog.regId}/summary-logs/${this.summaryLog.summaryLogId}/upload-completed`,
      JSON.stringify(this.payload)
    )
  },
  {
    timeout: pollTimeout
  }
)

When('I initiate the summary log upload', async function () {
  this.initiatePayload = {
    redirectUrl: `/v1/organisations/${this.summaryLog.orgId}/registrations/${this.summaryLog.regId}/summary-logs/${this.summaryLog.summaryLogId}`
  }
  this.response = await baseAPI.post(
    `/v1/organisations/${this.summaryLog.orgId}/registrations/${this.summaryLog.regId}/summary-logs`,
    JSON.stringify(this.initiatePayload),
    defraIdStub.authHeader(this.userId)
  )
})

Then('the summary log upload initiation succeeds', async function () {
  expect(this.response.statusCode).to.equal(201)
  this.responseData = await this.response.body.json()
  this.summaryLog.summaryLogId = this.responseData.summaryLogId
  this.uploadId = this.responseData.uploadId
})

When(
  'I upload the file {string} via the CDP uploader',
  async function (filename) {
    this.response = await cdpUploader.uploadAndScan(this.uploadId, filename)
  }
)

Then('the upload to CDP uploader succeeds', async function () {
  expect(this.response.statusCode).to.equal(302)
})

When(
  'I initiate the summary log upload without redirectUrl',
  async function () {
    // this.summaryLog = new SummaryLog()
    // this.summaryLog.orgId = '6507f1f77bcf86cd79943911'
    // this.summaryLog.regId = '6507f1f77bcf86cd79943912'
    this.initiatePayload = {}
    this.response = await baseAPI.post(
      `/v1/organisations/${this.summaryLog.orgId}/registrations/${this.summaryLog.regId}/summary-logs`,
      JSON.stringify(this.initiatePayload),
      defraIdStub.authHeader(this.userId)
    )
  }
)

When(
  'I try to access summary logs for organisation {string}',
  async function (organisationId) {
    this.initiatePayload = { redirectUrl: 'test-redirect' }
    this.response = await baseAPI.post(
      `/v1/organisations/${organisationId}/registrations/${this.summaryLog.regId}/summary-logs`,
      JSON.stringify(this.initiatePayload),
      defraIdStub.authHeader(this.userId)
    )
  }
)

Then('the organisations data update succeeds', async function () {
  if (!process.env.ENVIRONMENT) {
    if (this.response.statusCode === 422) {
      this.responseData = await this.response.body.json()
      if (
        this.responseData.message ===
        'Cannot transition organisation status from active to approved'
      ) {
        logger.info('Organisation already active, no update required')
      } else {
        expect.fail(
          `Organisation update failed with HTTP status code ${this.response.statusCode} and message: ${this.responseData.message}`
        )
      }
    } else {
      expect(this.response.statusCode).to.equal(200)
    }
  } else {
    logger.warn(
      {
        step_definition: 'Then the organisations data update succeeds'
      },
      'Skipping organisations data update checks'
    )
  }
})

When(
  'I check for the summary log status',
  { timeout: pollTimeout },
  async function () {
    const summaryLogId = this.summaryLog.summaryLogId
    const url = `/v1/organisations/${this.summaryLog.orgId}/registrations/${this.summaryLog.regId}/summary-logs/${summaryLogId}`

    // Transient statuses that indicate processing is still in progress
    const transientStatuses = ['preprocessing', 'validating']
    const timeout = pollTimeout
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      this.response = await baseAPI.get(
        url,
        defraIdStub.authHeader(this.userId)
      )

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
    this.response = await baseAPI.get(url, defraIdStub.authHeader(this.userId))
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

When(
  'I submit the uploaded summary log and initiate a new upload at the same time',
  async function () {
    const summaryLogId = this.summaryLog.summaryLogId
    const submissionResponse = await baseAPI.post(
      `/v1/organisations/${this.summaryLog.orgId}/registrations/${this.summaryLog.regId}/summary-logs/${summaryLogId}/submit`,
      '',
      defraIdStub.authHeader(this.userId)
    )

    const initiatePayload = {
      redirectUrl: 'summary-log-upload-redirect'
    }
    const uploadResponse = await baseAPI.post(
      `/v1/organisations/${this.summaryLog.orgId}/registrations/${this.summaryLog.regId}/summary-logs`,
      JSON.stringify(initiatePayload),
      defraIdStub.authHeader(this.userId)
    )
    this.response = await submissionResponse
    this.newUploadResponse = await uploadResponse
  }
)

Then(
  'the new upload attempt fails with message: {string}',
  async function (message) {
    expect(this.newUploadResponse.statusCode).to.equal(409)
    const responseMessage = await this.newUploadResponse.body.json()
    expect(responseMessage.message).to.equal(message)
  }
)

Then('the new upload attempt succeeds', async function () {
  expect(this.newUploadResponse.statusCode).to.equal(201)
})

Then('I call this upload {string}', function (name) {
  if (!this.namedUploads) {
    this.namedUploads = new Map()
  }
  this.namedUploads.set(name, {
    summaryLogId: this.summaryLog.summaryLogId,
    orgId: this.summaryLog.orgId,
    regId: this.summaryLog.regId
  })
})

When('I return to the {string} upload', function (name) {
  const upload = this.namedUploads?.get(name)
  if (!upload) {
    throw new Error(`No upload called '${name}'`)
  }
  this.summaryLog.summaryLogId = upload.summaryLogId
  this.summaryLog.orgId = upload.orgId
  this.summaryLog.regId = upload.regId
})

When('I submit the uploaded summary log', async function () {
  const summaryLogId = this.summaryLog.summaryLogId
  this.response = await baseAPI.post(
    `/v1/organisations/${this.summaryLog.orgId}/registrations/${this.summaryLog.regId}/summary-logs/${summaryLogId}/submit`,
    '',
    defraIdStub.authHeader(this.userId)
  )
})

Then('the summary log submission succeeds', async function () {
  expect(this.response.statusCode).to.equal(200)
})

Then(
  'the summary log submission status is {string}',
  { timeout: pollTimeout },
  async function (expectedStatus) {
    const summaryLogId = this.summaryLog.summaryLogId
    const url = `/v1/organisations/${this.summaryLog.orgId}/registrations/${this.summaryLog.regId}/summary-logs/${summaryLogId}`

    const timeout = pollTimeout
    const startTime = Date.now()
    let actualStatus

    while (Date.now() - startTime < timeout) {
      this.response = await baseAPI.get(
        url,
        defraIdStub.authHeader(this.userId)
      )

      // Parse response to check status
      const responseData = await this.response.body.json()
      actualStatus = responseData.status

      // If status matches, we are done
      if (actualStatus === expectedStatus) {
        this.responseData = responseData
        return
      }

      await new Promise((resolve) => setTimeout(resolve, interval))
    }

    expect(actualStatus).to.equal(
      expectedStatus,
      `Summary log submission status check failed with status ${actualStatus}`
    )
  }
)

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

    // responseData is already parsed in the status check step
    if (!this.responseData) {
      this.responseData = await this.response.body.json()
    }
    expect(this.responseData.status).to.equal(expectedResults.status)
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
      expectedResults.length,
      'Number of actual validation failures does not match expected value'
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
            ['Location Header', 'location.header'],
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

      if (!matchingRow || matchingRow.length === 0) {
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
  'the summary log is created in the database successfully',
  async function () {
    if (!process.env.ENVIRONMENT) {
      const summaryLogCollection = dbClient.collection('summary-logs')
      const summaryLog = await summaryLogCollection.findOne({
        _id: this.summaryLog.summaryLogId
      })
      expect(summaryLog._id).to.equal(this.summaryLog.summaryLogId)
      expect(summaryLog.file.id).to.equal(this.summaryLog.fileId)
      expect(summaryLog.file.name).to.equal(this.summaryLog.filename)
      expect(summaryLog.file.status).to.equal(this.summaryLog.fileStatus)
      switch (this.summaryLog.fileStatus) {
        case 'complete':
          expect(summaryLog.file.uri).to.equal(
            `s3://${this.summaryLog.s3Bucket}/${this.summaryLog.s3Key}`
          )
          break
        case 'rejected':
          expect(summaryLog.validation.failures[0].code).to.equal(
            'FILE_REJECTED'
          )
          break
      }
    } else {
      logger.warn(
        {
          step_definition:
            'Then the summary log is created in the database successfully'
        },
        'Skipping summary log database checks'
      )
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
      const expectedWasteRecords = dataTable.hashes()
      const wasteRecords = await wasteRecordsCollection
        .find({
          organisationId: expectedWasteRecords[0].OrganisationId,
          registrationId: expectedWasteRecords[0].RegistrationId
        })
        .toArray()
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

        const groupedByType = wasteRecords.reduce((acc, rec) => {
          const type = rec.type
          if (!acc[type]) acc[type] = []
          acc[type].push(rec)
          return acc
        }, {})

        Object.entries(groupedByType).forEach(([type, group]) => {
          const sameTimestamp = group.every(
            (obj) =>
              obj.versions[0].createdAt === group[0].versions[0].createdAt
          )

          expect(sameTimestamp).to.equal(
            true,
            `All waste records of type ${type} created on the same upload should have the same timestamp`
          )
        })
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

Then(
  'I should see that waste balances are created in the database with the following values',
  async function (dataTable) {
    if (!process.env.ENVIRONMENT) {
      const wasteBalancesCollection = dbClient.collection('waste-balances')
      const expectedWasteBalances = dataTable.hashes()
      const wasteBalances = await wasteBalancesCollection
        .find({
          organisationId: expectedWasteBalances[0].OrganisationId,
          accreditationId: expectedWasteBalances[0].AccreditationId
        })
        .toArray()
      expect(wasteBalances.length).to.equal(expectedWasteBalances.length)

      for (const expectedWasteBalance of expectedWasteBalances) {
        const matchingRecord = wasteBalances.find(
          (wasteBalance) =>
            wasteBalance.organisationId ===
              expectedWasteBalance.OrganisationId &&
            wasteBalance.accreditationId ===
              expectedWasteBalance.AccreditationId &&
            parseFloat(wasteBalance.amount).toFixed(2) ===
              parseFloat(expectedWasteBalance.Amount).toFixed(2) &&
            parseFloat(wasteBalance.availableAmount).toFixed(2) ===
              parseFloat(expectedWasteBalance.AvailableAmount).toFixed(2)
        )

        if (!matchingRecord) {
          expect.fail(
            `Expected record: ${JSON.stringify(expectedWasteBalance)}, but no waste balances found with those values. Actual waste balances found: ${JSON.stringify(wasteBalances)}`
          )
        }
      }
    } else {
      logger.warn(
        {
          step_definition:
            'Then I should see that waste balances are created in the database with the following values'
        },
        'Skipping waste balances database checks'
      )
    }
  }
)

Then('the submitted summary log should not have an expiry', async function () {
  if (!process.env.ENVIRONMENT) {
    const summaryLogsCollection = dbClient.collection('summary-logs')
    const summaryLog = await summaryLogsCollection.findOne({
      _id: this.summaryLog.summaryLogId
    })
    expect(summaryLog.expiresAt).to.equal(null)
  }
})
