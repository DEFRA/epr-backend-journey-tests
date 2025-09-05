import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export class DockerLogTester {
  constructor(containerName) {
    this.containerName = containerName
  }

  // Get logs since test started or specific time
  async getLogs() {
    const utcTimestamp = new Date().toISOString().slice(0, 19)

    const cmd = `docker logs ${this.containerName} --since ${utcTimestamp}`

    try {
      const { stdout, stderr } = await execAsync(cmd)
      return stdout + stderr
    } catch (error) {
      throw new Error(`Failed to get logs: ${error.message}`)
    }
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

      // console.log(timeToISO("13:56:11.168"));

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

  // Test log assertions
  async assertLogs(assertions) {
    const logs = await this.getLogs()

    const now = new Date()
    const cutoffTime = new Date(now.getTime() - 5000)

    const logLines = this.parseLogs(logs).filter((item) => {
      const itemTime = new Date(item.timestamp)
      return itemTime >= cutoffTime
    })

    const results = assertions.map((assertion) => {
      try {
        const result = assertion(logLines)
        return { passed: true, result }
      } catch (error) {
        return { passed: false, error: error.message }
      }
    })

    const failed = results.filter((r) => !r.passed)
    if (failed.length > 0) {
      throw new Error(
        `Log assertions failed:\n${failed.map((f) => f.error).join('\n')}`
      )
    }

    return results
  }

  // Common assertion helpers
  static assertions = {
    hasLogLevel: (level) => (logs) => {
      const found = logs.find((log) => log.logLevel === level.toUpperCase())
      if (!found) throw new Error(`No ${level} logs found`)
      return found
    },

    hasEventAction: (action) => (logs) => {
      const found = logs.find((log) => log.body?.event?.action === action)
      if (!found) throw new Error(`No logs with event.action: ${action}`)
      return found
    },

    hasMessage: (expectedMessage) => (logs) => {
      const found = logs.find((log) => log.body?.message === expectedMessage)
      if (!found) throw new Error(`No logs with message: ${expectedMessage}`)
      return found
    }
  }
}
