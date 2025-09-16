import { Then } from '@cucumber/cucumber'
import { expect } from 'chai'
import { DockerLogParser } from '../support/docker.js'
import logger from '../support/logger.js'

const dockerLogParser = new DockerLogParser(
  'epr-backend-journey-tests-epr-backend-1'
)

Then(
  'the following information appears in the log',
  { timeout: 10000 },
  async function (dataTable) {
    if (process.env.WITH_LOGS) {
      const expectedLog = dataTable.rowsHash()
      const log = await dockerLogParser.waitForLog(expectedLog.Message)
      expect(log.logLevel).to.equal(expectedLog['Log Level'])
      expect(log.body?.event?.action).to.equal(expectedLog['Event Action'])
      expect(log.body?.message).to.contain(expectedLog.Message)
    } else {
      logger.warn(
        {
          // eslint-disable-next-line camelcase
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
    if (process.env.WITH_LOGS) {
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
          // eslint-disable-next-line camelcase
          step_definition: 'Then the following audit logs are present'
        },
        'Skipping docker audit log tests'
      )
    }
  }
)
