import fs from 'node:fs'
import path from 'node:path'
import logger from './logger.js'

const cleanupFilePath = path.resolve(
  process.cwd(),
  'test-artifacts',
  'created-org-ids.txt'
)

function ensureDir() {
  const dir = path.dirname(cleanupFilePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

export function trackCreatedOrgId(orgId) {
  if (!orgId) {
    return
  }
  try {
    ensureDir()
    // Synchronous append so the ID lands on disk before the caller continues —
    // POSIX guarantees atomic writes under PIPE_BUF (4096 bytes) so concurrent
    // workers can't interleave partial lines.
    fs.appendFileSync(cleanupFilePath, `${orgId}\n`)
  } catch (err) {
    // Best-effort: never fail a test because the tracker couldn't write.
    logger.warn(
      `cleanup-tracker: failed to record orgId ${orgId}: ${err.message}`
    )
  }
}

export function resetTracker() {
  try {
    ensureDir()
    fs.writeFileSync(cleanupFilePath, '')
  } catch (err) {
    logger.warn(`cleanup-tracker: failed to reset tracker: ${err.message}`)
  }
}

export { cleanupFilePath }
