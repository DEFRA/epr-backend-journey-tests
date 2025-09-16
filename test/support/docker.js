import { exec } from 'child_process'
import { promisify } from 'util'
import crypto from 'crypto'
import { testStartTime } from './hooks.js'

const execAsync = promisify(exec)

const logsBufferTime = 10

export class DockerLogParser {
  constructor(containerName) {
    this.containerName = containerName
    this.processedLogs = new Map()
    this.processedAuditLogs = new Map()
  }

  async getLogs() {
    const now = new Date()
    const currentTimestamp = new Date(now.getTime() - logsBufferTime * 1000)
      .toISOString()
      .slice(0, 19)

    // We take the latest timestamp between the test start time and the current time
    // This is so to prevent an edge case where a test is re-run quickly between runs and we only care about the logs
    // from the existing test start time
    const latestTimestamp = new Date(
      Math.max(new Date(testStartTime), new Date(currentTimestamp))
    )
      .toISOString()
      .slice(0, 19)

    const primaryCmd = `docker logs ${this.containerName} --since ${latestTimestamp}Z`
    const fallbackCmd = `docker logs 'epr-backend-epr-backend-1' --since ${latestTimestamp}Z`

    const commands = [primaryCmd, fallbackCmd]
    let lastError

    for (const cmd of commands) {
      try {
        const { stdout, stderr } = await execAsync(cmd)
        return stdout + stderr
      } catch (error) {
        this.containerName = 'epr-backend-epr-backend-1'
        lastError = error
      }
    }

    throw new Error(`Failed to get logs: ${lastError.message}`)
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

  parseLogs(logText) {
    const regex =
      /\[(\d{2}:\d{2}:\d{2}\.\d{3})\] (\w+) \(\d+\):\s*([\s\S]*?)(?=\n\[|$)/g

    const results = []
    let match

    while ((match = regex.exec(logText)) !== null) {
      const [, ts, logLevel, bodyText] = match

      const parsedBody = this.parseLogBody(bodyText.trim())

      const timeToISO = (
        timeStr,
        date = new Date().toISOString().split('T')[0]
      ) => new Date(`${date}T${timeStr}Z`).toISOString()

      const timestamp = timeToISO(ts)

      results.push({
        timestamp,
        logLevel,
        body: parsedBody
      })
    }

    return results
  }

  parseLogBody(bodyText) {
    const result = {}

    // Regex to match key-value pairs
    // Matches: key: "string" OR key: { JSON object } OR key: [ JSON array ]
    const kvRegex =
      /(\w+):\s*(?:"([^"]*)"|\{([\s\S]*?)\}(?=\s*\w+:|$)|\[([\s\S]*?)\](?=\s*\w+:|$))/g

    let match
    while ((match = kvRegex.exec(bodyText)) !== null) {
      const [, key, stringValue, objectValue, arrayValue] = match

      if (stringValue !== undefined) {
        // Handle string values
        result[key] = stringValue
      } else if (objectValue !== undefined) {
        // Handle JSON objects
        try {
          const jsonString = `{${objectValue}}`
          result[key] = JSON.parse(jsonString)
        } catch (error) {
          result[key] = `{${objectValue}}`
        }
      } else if (arrayValue !== undefined) {
        // Handle JSON arrays
        try {
          const jsonString = `[${arrayValue}]`
          result[key] = JSON.parse(jsonString)
        } catch (error) {
          result[key] = `[${arrayValue}]`
        }
      }
    }

    return result
  }

  async retrieveAuditLogs() {
    const logs = await this.getLogs()
    return this.parseAuditLogs(logs)
  }

  async waitForLog(pattern, options = {}) {
    const { timeout = logsBufferTime * 1000, interval = 1000 } = options
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      const logs = await this.getLogs()
      const logLines = this.parseLogs(logs)

      const found = logLines.find((log) => {
        if (this.processedLogs.has(log.timestamp)) {
          return false
        }
        return log.body.message?.includes(pattern)
      })

      if (found) {
        this.processedLogs.set(found.timestamp, found)
        return found
      }

      await new Promise((resolve) => setTimeout(resolve, interval))
    }

    throw new Error(`Log pattern not found within ${timeout}ms: ${pattern}`)
  }
}
