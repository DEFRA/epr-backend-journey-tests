import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export class DockerLogTester {
  constructor(containerName) {
    this.containerName = containerName
  }

  async getLogs() {
    const utcTimestamp = new Date().toISOString().slice(0, 19)

    const cmd = `docker logs ${this.containerName} --since ${utcTimestamp} --tail 200`

    try {
      const { stdout, stderr } = await execAsync(cmd)
      return stdout + stderr
    } catch (error) {
      throw new Error(`Failed to get logs: ${error.message}`)
    }
  }

  async filterAuditLogsByTime(auditLogs, secondsBack = 5) {
    const now = new Date()
    const cutoffTime = new Date(now.getTime() - secondsBack * 1000)

    return auditLogs.filter((log) => {
      const logTime = new Date(log.time)
      return logTime >= cutoffTime
    })
  }

  async parseAuditLogs(logText, secondsBack = 5) {
    const lines = logText.trim().split('\n')
    const result = {
      message: null,
      auditLogs: []
    }

    lines.forEach((line) => {
      const responseMatch = line.match(/\[response\]\s+(.+?)\s+\d+\s+\(\d+ms\)/)
      if (responseMatch) {
        result.message = `[response] ${responseMatch[1]}`
        return
      }

      // Try to parse as JSON (audit logs)
      try {
        const parsed = JSON.parse(line)
        if (parsed['log.level'] === 'audit') {
          result.auditLogs.push(parsed)
        }
      } catch (e) {
        // Not JSON or not an audit log, skip
      }
    })

    result.auditLogs = await this.filterAuditLogsByTime(
      result.auditLogs,
      secondsBack
    )

    return result
  }

  parseLogs(logText) {
    // Regex to match the log entry
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

  // Wait for a specific log pattern to appear
  async waitForLog(pattern, options = {}) {
    const { timeout = 5000, interval = 1000 } = options
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      const logs = await this.getLogs()
      const logLines = this.parseLogs(logs)

      const found = logLines.find((log) => {
        return log.body.message?.includes(pattern)
      })

      if (found) {
        return found
      }

      await new Promise((resolve) => setTimeout(resolve, interval))
    }

    throw new Error(`Log pattern not found within ${timeout}ms: ${pattern}`)
  }
}
