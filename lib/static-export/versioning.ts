// lib/static-export/versioning.ts
/**
 * Version Management for Static Builds
 * Handles semantic versioning and deployment tracking
 */

export interface ParsedVersion {
  major: number
  minor: number
  patch: number
  timestamp: string
}

let versionCounter = 0
const startTime = Date.now()

/**
 * Generates a unique version string with semantic versioning and timestamp
 * Format: v{major}.{minor}.{patch}-{ISO8601timestamp}
 */
export function generateVersion(): string {
  const now = new Date()
  const isoTimestamp = now.toISOString()
  
  // Increment counter for uniqueness
  versionCounter++
  
  // Calculate major/minor/patch based on time elapsed
  const elapsed = Date.now() - startTime
  const majorPart = Math.floor(elapsed / (24 * 60 * 60 * 1000)) + 1 // Increment daily
  const minorPart = Math.floor((elapsed % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)) // Hourly
  const patchPart = versionCounter % 100 // Incremental counter
  
  return `v${majorPart}.${minorPart}.${patchPart}-${isoTimestamp}`
}

/**
 * Parses a version string and extracts semantic version components
 * Returns null if version format is invalid
 */
export function parseVersion(versionString: string): ParsedVersion | null {
  // Match format: v{major}.{minor}.{patch}-{timestamp}
  const versionRegex = /^v(\d+)\.(\d+)\.(\d+)-(.+)$/
  const match = versionString.match(versionRegex)
  
  if (!match) {
    return null
  }
  
  const [, majorStr, minorStr, patchStr, timestamp] = match
  
  // Validate numbers are non-negative
  const major = parseInt(majorStr, 10)
  const minor = parseInt(minorStr, 10)
  const patch = parseInt(patchStr, 10)
  
  if (isNaN(major) || isNaN(minor) || isNaN(patch)) {
    return null
  }
  
  // Validate timestamp is valid ISO 8601
  if (!isValidISOTimestamp(timestamp)) {
    return null
  }
  
  return {
    major,
    minor,
    patch,
    timestamp,
  }
}

/**
 * Validates ISO 8601 timestamp format
 */
function isValidISOTimestamp(timestamp: string): boolean {
  try {
    const date = new Date(timestamp)
    return !isNaN(date.getTime())
  } catch {
    return false
  }
}

/**
 * Compares two version strings
 * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
  const parsed1 = parseVersion(v1)
  const parsed2 = parseVersion(v2)
  
  if (!parsed1 || !parsed2) {
    throw new Error('Invalid version format')
  }
  
  // Compare major
  if (parsed1.major !== parsed2.major) {
    return parsed1.major < parsed2.major ? -1 : 1
  }
  
  // Compare minor
  if (parsed1.minor !== parsed2.minor) {
    return parsed1.minor < parsed2.minor ? -1 : 1
  }
  
  // Compare patch
  if (parsed1.patch !== parsed2.patch) {
    return parsed1.patch < parsed2.patch ? -1 : 1
  }
  
  // Compare timestamps
  const time1 = new Date(parsed1.timestamp).getTime()
  const time2 = new Date(parsed2.timestamp).getTime()
  
  if (time1 === time2) return 0
  return time1 < time2 ? -1 : 1
}

/**
 * Resets version counter (useful for testing)
 */
export function resetVersionCounter(): void {
  versionCounter = 0
}
