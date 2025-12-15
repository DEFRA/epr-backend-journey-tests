import { exec } from 'child_process'
import { promisify } from 'util'
import crypto from 'crypto'

const execAsync = promisify(exec)

const logsLookBackInSeconds = 6
const logLinesLimit = 50

export class DockerLogParser {
  constructor(containerName) {
    this.containerName = containerName
    this.processedLogs = new Map()
    this.processedAuditLogs = new Map()
    this.testStartTime = new Date()
  }

  async getLogs() {
    const now = new Date()
    const currentTimestamp = new Date(
      now.getTime() - logsLookBackInSeconds * 1000
    )
      .toISOString()
      .slice(0, 19)

    // We take the latest timestamp between the test start time and the current time
    // This is so to prevent an edge case where a test is re-run quickly between runs and we only care about the logs
    // from the existing test start time
    const latestTimestamp = new Date(
      Math.max(new Date(this.testStartTime), new Date(currentTimestamp))
    )
      .toISOString()
      .slice(0, 19)

    try {
      return await this.runDockerCommand(latestTimestamp)
    } catch (error) {
      throw new Error(`Failed to get logs: ${error.message}`)
    }
  }

  runDockerCommand = async function (latestTimestamp) {
    const { stdout, stderr } = await execAsync(
      `docker logs ${this.containerName} -n ${logLinesLimit} --since ${latestTimestamp}Z`
    )
    return stdout + stderr
  }

  generateLogKey(time, context) {
    const contextString = JSON.stringify(context, Object.keys(context).sort())
    const contextHash = crypto
      .createHash('sha256')
      .update(contextString)
      .digest('hex')
      .substring(0, 16)
    return `${time}_${contextHash}`
  }

  async parseAuditLogs(logText) {
    const lines = logText.trim().split('\n')
    const auditLogs = []

    lines.forEach((line) => {
      try {
        const parsedAuditLog = JSON.parse(line)
        if (parsedAuditLog['log.level'] === 'audit') {
          const key = this.generateLogKey(
            parsedAuditLog.time,
            parsedAuditLog.context
          )
          if (!this.processedAuditLogs.has(key)) {
            auditLogs.push(parsedAuditLog)
            this.processedAuditLogs.set(key, parsedAuditLog)
          }
        }
      } catch (e) {
        // Not JSON or not an audit log, skip
      }
    })

    return auditLogs
  }

  parseJsonLogs(logText) {
    const lines = logText.trim().split('\n')
    const logs = []

    lines.forEach((line) => {
      try {
        const parsedLog = JSON.parse(line)
        if (parsedLog['log.level'] !== 'audit') {
          logs.push(parsedLog)
        }
      } catch (e) {
        // Not JSON or not an audit log, skip
      }
    })

    return logs
  }

  async retrieveAuditLogs() {
    const logs = await this.getLogs()
    return this.parseAuditLogs(logs)
  }

  async waitForLog(pattern, options = {}) {
    const { timeout = logsLookBackInSeconds * 1000, interval = 250 } = options
    const startTime = Date.now()

    let logLines = []

    while (Date.now() - startTime < timeout) {
      const logs = await this.getLogs()
      logLines = this.parseJsonLogs(logs)

      const found = logLines.find((log) => {
        const key = this.generateLogKey(log['@timestamp'], log.message)
        if (this.processedLogs.has(key)) {
          return false
        }
        return log.message?.includes(pattern)
      })

      if (found) {
        const key = this.generateLogKey(found['@timestamp'], found.message)
        this.processedLogs.set(key, found)
        return [found]
      }

      await new Promise((resolve) => setTimeout(resolve, interval))
    }

    return logLines
  }
}
