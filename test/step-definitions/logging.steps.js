import { Then } from '@cucumber/cucumber'
import { expect } from 'chai'
import { DockerLogTester } from '../support/docker.js'

const dockerLogTester = new DockerLogTester(
  'epr-backend-journey-tests-epr-backend-1'
)

Then(
  'the following information appears in the log',
  { timeout: 10000 },
  async function (dataTable) {
    if (process.env.WITH_LOGS) {
      const expectedLog = dataTable.rowsHash()
      const log = await dockerLogTester.waitForLog(expectedLog.Message)
      expect(log.logLevel).to.equal(expectedLog['Log Level'])
      expect(log.body?.event?.action).to.equal(expectedLog['Event Action'])
      expect(log.body?.message).to.contain(expectedLog.Message)
    }
  }
)

Then(
  'the following audit logs are present',
  { timeout: 10000 },
  async function (dataTable) {
    if (process.env.WITH_LOGS) {
      const expectedLogs = dataTable.hashes()
      const actualLogs = await dockerLogTester.retrieveAuditLogs()

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
    }
  }
)
