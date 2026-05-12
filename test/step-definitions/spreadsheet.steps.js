import { When } from '@cucumber/cucumber'
import { generateSpreadsheetData } from '../support/spreadsheet/summarylogs-spreadsheet-data-generator.js'
import { cdpUploader, defraIdStub, eprBackendAPI } from '../support/hooks.js'
import { expect } from 'chai'
import config from '../config/config.js'
import { SummaryLog } from '../support/generator.js'
import logger from '../support/logger.js'
import { DockerLogParser } from '../support/docker.log.parser.js'

When(
  'I generate the Summary Log spreadsheets and upload with the following',
  { timeout: 300000 },
  async function (dataTable) {
    const dockerLogParser = new DockerLogParser(
      config.dockerLogParser.containerName
    )

    const data = dataTable.rowsHash()
    const numRows = parseInt(data.numberOfRows)
    const iterations = parseInt(data.iterations)

    const options = {
      wasteProcessingType: data.wasteProcessingType,
      numberOfRows: numRows,
      materialSuffix: data.materialSuffix,
      accNumber: data.accNumber,
      regNumber: data.regNumber,
      rowOffset: 0,
      silentLogging: true
    }

    for (let i = 0; i < iterations; i++) {
      logger.info(
        `Iteration ${i + 1} of ${iterations}, ${numRows + options.rowOffset} rows (per worksheet)`
      )

      const file = await generateSpreadsheetData(options)

      this.summaryLog = new SummaryLog()
      this.summaryLog.orgId = this.organisationId
      this.summaryLog.regId = this.registrationId
      this.summaryLog.accId = this.accreditationId

      this.initiatePayload = {
        redirectUrl: `/v1/organisations/${this.summaryLog.orgId}/registrations/${this.summaryLog.regId}/summary-logs/${this.summaryLog.summaryLogId}`
      }
      this.response = await eprBackendAPI.post(
        `/v1/organisations/${this.summaryLog.orgId}/registrations/${this.summaryLog.regId}/summary-logs`,
        JSON.stringify(this.initiatePayload),
        defraIdStub.authHeader(this.userId)
      )

      expect(this.response.statusCode).to.equal(201)
      this.responseData = await this.response.body.json()
      this.summaryLog.summaryLogId = this.responseData.summaryLogId
      this.uploadId = this.responseData.uploadId

      this.response = await cdpUploader.uploadMultipartForm(
        this.uploadId,
        'summaryLogUpload',
        [file],
        ''
      )

      expect(this.response.statusCode).to.equal(302)

      const summaryLogId = this.summaryLog.summaryLogId

      let expectedStatus = 'validated'
      const url = `/v1/organisations/${this.summaryLog.orgId}/registrations/${this.summaryLog.regId}/summary-logs/${summaryLogId}`

      const timeout = 30000
      const startTime = Date.now()
      let actualStatus

      while (Date.now() - startTime < timeout) {
        this.response = await eprBackendAPI.get(
          url,
          defraIdStub.authHeader(this.userId)
        )

        // Parse response to check status
        const responseData = await this.response.body.json()
        actualStatus = responseData.status

        // If status matches, we are done
        if (actualStatus === expectedStatus) {
          this.responseData = responseData
          break
        }

        await new Promise((resolve) => setTimeout(resolve, config.interval))
      }

      expect(actualStatus).to.equal(
        expectedStatus,
        `Summary log submission status check failed with status ${actualStatus}`
      )

      this.response = await eprBackendAPI.post(
        `/v1/organisations/${this.summaryLog.orgId}/registrations/${this.summaryLog.regId}/summary-logs/${summaryLogId}/submit`,
        '',
        defraIdStub.authHeader(this.userId)
      )

      expect(this.response.statusCode).to.equal(200)

      expectedStatus = 'submitted'

      while (Date.now() - startTime < timeout) {
        this.response = await eprBackendAPI.get(
          url,
          defraIdStub.authHeader(this.userId)
        )

        // Parse response to check status
        const responseData = await this.response.body.json()
        actualStatus = responseData.status

        // If status matches, we are done
        if (actualStatus === expectedStatus) {
          this.responseData = responseData
          break
        } else {
          const logs = await dockerLogParser.waitForLog('Command failed')
          const filteredLogs = logs.filter(
            (log) =>
              log['log.level'] === 'warn' &&
              log.message.includes('Command failed')
          )
          if (filteredLogs.length > 0) {
            expect.fail(
              `Submission failed at iteration: ${i + 1} of ${iterations} and ${numRows + options.rowOffset} rows (per worksheet)`
            )
          }
        }

        await new Promise((resolve) => setTimeout(resolve, config.interval))
      }

      options.filename = file
      options.rowOffset += numRows
    }
  }
)
