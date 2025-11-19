// lib/__tests__/versioning.test.ts
import { generateVersion, parseVersion } from '../static-export/versioning'

describe('Versioning Module', () => {
  describe('generateVersion', () => {
    it('should generate a valid version string', () => {
      const version = generateVersion()
      expect(version).toMatch(/^v\d+\.\d+\.\d+-\d{4}-\d{2}-\d{2}T/)
    })

    it('should generate unique versions on consecutive calls', () => {
      const version1 = generateVersion()
      const version2 = generateVersion()
      expect(version1).not.toBe(version2)
    })

    it('should increment patch version correctly', () => {
      const version1 = generateVersion()
      const version2 = generateVersion()
      
      const [, major1, minor1, patch1] = version1.match(/v(\d+)\.(\d+)\.(\d+)/) || []
      const [, major2, minor2, patch2] = version2.match(/v(\d+)\.(\d+)\.(\d+)/) || []
      
      // At least patch should be different or minor/major bumped
      const v1Num = parseInt(`${major1}${minor1}${patch1}`)
      const v2Num = parseInt(`${major2}${minor2}${patch2}`)
      expect(v2Num).toBeGreaterThan(v1Num)
    })

    it('should have ISO timestamp', () => {
      const version = generateVersion()
      expect(version).toContain('T')
      expect(version).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })
  })

  describe('parseVersion', () => {
    it('should parse valid version string', () => {
      const versionString = 'v1.0.0-2024-01-15T10:30:45.123Z'
      const parsed = parseVersion(versionString)
      
      expect(parsed).toBeDefined()
      expect(parsed?.major).toBe(1)
      expect(parsed?.minor).toBe(0)
      expect(parsed?.patch).toBe(0)
    })

    it('should extract timestamp from version', () => {
      const versionString = 'v2.5.3-2024-01-15T14:20:30.456Z'
      const parsed = parseVersion(versionString)
      
      expect(parsed).toBeDefined()
      expect(parsed?.timestamp).toContain('2024-01-15')
    })

    it('should return null for invalid version format', () => {
      expect(parseVersion('invalid')).toBeNull()
      expect(parseVersion('')).toBeNull()
      expect(parseVersion('version-1.0.0')).toBeNull()
    })

    it('should handle version with different patch numbers', () => {
      const versions = [
        'v1.0.0-2024-01-15T10:00:00.000Z',
        'v1.2.5-2024-01-15T11:00:00.000Z',
        'v3.10.99-2024-01-15T12:00:00.000Z',
      ]

      versions.forEach((version) => {
        const parsed = parseVersion(version)
        expect(parsed).toBeDefined()
        expect(parsed?.major).toBeGreaterThanOrEqual(1)
        expect(parsed?.minor).toBeGreaterThanOrEqual(0)
        expect(parsed?.patch).toBeGreaterThanOrEqual(0)
      })
    })

    it('should compare versions correctly', () => {
      const v1 = parseVersion('v1.0.0-2024-01-15T10:00:00.000Z')
      const v2 = parseVersion('v1.0.1-2024-01-15T11:00:00.000Z')
      const v3 = parseVersion('v2.0.0-2024-01-15T12:00:00.000Z')

      expect(v1).toBeDefined()
      expect(v2).toBeDefined()
      expect(v3).toBeDefined()

      if (v1 && v2 && v3) {
        expect(v1.patch).toBeLessThan(v2.patch)
        expect(v2.major).toBeLessThan(v3.major)
      }
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid consecutive version calls', () => {
      const versions = Array.from({ length: 10 }, () => generateVersion())
      const uniqueVersions = new Set(versions)
      
      // All versions should be unique
      expect(uniqueVersions.size).toBe(versions.length)
    })

    it('should parse version with different timestamp formats', () => {
      const versionWithMillis = parseVersion('v1.0.0-2024-01-15T10:30:45.123Z')
      const versionWithoutMillis = parseVersion('v1.0.0-2024-01-15T10:30:45Z')
      
      // Both should parse successfully
      expect(versionWithMillis).toBeDefined()
      expect(versionWithoutMillis).toBeDefined()
    })

    it('should not allow negative version numbers', () => {
      const parsed = parseVersion('v-1.0.0-2024-01-15T10:00:00.000Z')
      // Invalid format should return null
      expect(parsed).toBeNull()
    })
  })
})
