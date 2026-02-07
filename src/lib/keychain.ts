import { execSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { userInfo } from 'node:os'

export interface KeychainCredentials {
  claudeAiOauth: {
    accessToken: string
    refreshToken: string
    expiresAt: number
    subscriptionType: string
  }
}

export function computeKeychainSuffix(configDirPath: string): string {
  const hash = createHash('sha256').update(configDirPath).digest('hex')
  return `-${hash.slice(0, 8)}`
}

const HEX_PATTERN = /^[0-9a-f]+$/

export function isHexEncoded(value: string): boolean {
  return value.length > 0 && value.length % 2 === 0 && HEX_PATTERN.test(value)
}

export function hexDecode(hex: string): string {
  return Buffer.from(hex, 'hex').toString('utf-8')
}

export function hexEncode(value: string): string {
  return Buffer.from(value, 'utf-8').toString('hex')
}

export function readKeychainCredentials(configDirPath: string): KeychainCredentials | null {
  if (process.platform !== 'darwin') {
    return null
  }

  try {
    const suffix = computeKeychainSuffix(configDirPath)
    const service = `Claude Code-credentials${suffix}`
    const account = userInfo().username

    const output = execSync(`security find-generic-password -s "${service}" -a "${account}" -w`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim()

    const decoded = isHexEncoded(output) ? hexDecode(output) : output
    const parsed = JSON.parse(decoded) as KeychainCredentials
    return parsed
  } catch {
    return null
  }
}

export function writeKeychainCredentials(configDirPath: string, credentials: KeychainCredentials): boolean {
  if (process.platform !== 'darwin') {
    return false
  }

  try {
    const suffix = computeKeychainSuffix(configDirPath)
    const service = `Claude Code-credentials${suffix}`
    const account = userInfo().username
    const encoded = hexEncode(JSON.stringify(credentials))

    // Delete existing entry first (ignore errors if it doesn't exist)
    try {
      execSync(`security delete-generic-password -s "${service}" -a "${account}"`, { stdio: ['pipe', 'pipe', 'pipe'] })
    } catch {
      // Entry may not exist, that's fine
    }

    execSync(`security add-generic-password -s "${service}" -a "${account}" -w "${encoded}"`, {
      stdio: ['pipe', 'pipe', 'pipe']
    })

    return true
  } catch {
    return false
  }
}
