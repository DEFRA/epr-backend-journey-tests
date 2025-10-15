import { Then } from '@cucumber/cucumber'
import { expect } from 'chai'
import { DockerLogParser } from '../support/docker.log.parser.js'
import logger from '../support/logger.js'
import config from '../config/config.js'
import { interpolator } from '../support/hooks.js'

const dockerLogParser = new DockerLogParser(
  config.dockerLogParser.containerName
)

Then(
  'the following messages appear in the log',
  { timeout: 10000 },
  async function (dataTable) {
    if (config.testLogs) {
      const expectedLogs = dataTable.hashes()

      for (const expectedLog of expectedLogs) {
        let expectedMessage = expectedLog.Message
        expectedMessage = interpolator.interpolate(this, expectedMessage)

        const logs = await dockerLogParser.waitForLog(expectedMessage)
        if (logs.length > 1) {
          const actualLogs = logs
            .filter(
              (log) =>
                log['log.level'] === expectedLog['Log Level'] &&
                log.message != null
            )
            .map((filtered) => filtered.message)
            .join('\n')
          expect.fail(
            `No log found for the following expected log message: ${expectedMessage} \n Actual logs: ${actualLogs}`
          )
        } else {
          const actualLog = logs[0]
          expect(actualLog['log.level']).to.equal(expectedLog['Log Level'])
          expect(actualLog.event?.action).to.equal(expectedLog['Event Action'])
          expect(actualLog.message).to.contain(expectedMessage)
        }
      }
    } else {
      logger.warn(
        {
          step_definition: 'Then the following messages appear in the log'
        },
        'Skipping docker logging tests'
      )
    }
  }
)

Then(
  'the following audit logs are present',
  { timeout: 10000 },
  async function (dataTable) {
    if (config.testLogs) {
      const expectedLogs = dataTable.hashes()
      const actualLogs = await dockerLogParser.retrieveAuditLogs()

      for (const expectedLogRow of expectedLogs) {
        const expectedAuditCount = parseInt(expectedLogRow.Count)
        const filtered = actualLogs.filter(
          (log) =>
            log.event.category === expectedLogRow['Event Category'] &&
            log.event.action === expectedLogRow['Event Action'] &&
            Object.keys(log.context).join(', ') ===
              expectedLogRow['Context Keys']
        )
        if (filtered.length !== expectedAuditCount) {
          logger.info(filtered.length + ' audit logs found')
          logger.info(expectedLogRow.Count + ' expected logs found')
          expect.fail(
            `Expected ${expectedLogRow.Count} audit logs for the following event category: ${expectedLogRow['Event Category']}, Found actual audit logs: ${JSON.stringify(
              actualLogs
            )}`
          )
        }
        expect(filtered.length).to.equal(expectedAuditCount)
      }
    } else {
      logger.warn(
        {
          step_definition: 'Then the following audit logs are present'
        },
        'Skipping docker audit log tests'
      )
    }
  }
)
