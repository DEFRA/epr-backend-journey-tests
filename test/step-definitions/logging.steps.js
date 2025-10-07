import { Then } from '@cucumber/cucumber'
import { expect } from 'chai'
import { DockerLogParser } from '../support/docker.log.parser.js'
import logger from '../support/logger.js'
import config from '../config/config.js'

const dockerLogParser = new DockerLogParser(
  config.dockerLogParser.containerName,
  config.dockerLogParser.fallbackContainerName
)

Then(
  'the following information appears in the log',
  { timeout: 10000 },
  async function (dataTable) {
    if (config.testLogs) {
      const expectedLog = dataTable.rowsHash()
      const logs = await dockerLogParser.waitForLog(expectedLog.Message)
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
          `No log found for the following expected log message: ${expectedLog.Message} \n Actual logs: ${actualLogs}`
        )
      } else {
        const actualLog = logs[0]
        expect(actualLog['log.level']).to.equal(expectedLog['Log Level'])
        expect(actualLog.event?.action).to.equal(expectedLog['Event Action'])
        expect(actualLog.message).to.contain(expectedLog.Message)
      }
    } else {
      logger.warn(
        {
          step_definition: 'Then the following information appears in the log'
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
        const filtered = actualLogs.filter(
          (log) =>
            log.event.category === expectedLogRow['Event Category'] &&
            log.event.action === expectedLogRow['Event Action'] &&
            Object.keys(log.context).join(', ') ===
              expectedLogRow['Context Keys']
        )
        expect(filtered.length).to.equal(parseInt(expectedLogRow.Count))
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
