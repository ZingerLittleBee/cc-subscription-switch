import { execSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { userInfo } from 'node:os'
import { join } from 'node:path'

export interface KeychainCredentials {
  claudeAiOauth: {
    accessToken: string
    refreshToken: string
    expiresAt: number
    subscriptionType: string
  }
}

export type CredentialSource = 'file' | 'keychain'

export interface LoadedCredentials {
  credentials: KeychainCredentials
  source: CredentialSource
}

export function computeKeychainSuffix(configDirPath: string): string {
  const hash = createHash('sha256').update(configDirPath).digest('hex')
  return `-${hash.slice(0, 8)}`
}

const HEX_PATTERN = /^[0-9a-fA-F]+$/

export function isHexEncoded(value: string): boolean {
  return value.length > 0 && value.length % 2 === 0 && HEX_PATTERN.test(value)
}

export function hexDecode(hex: string): string {
  return Buffer.from(hex, 'hex').toString('utf-8')
}

function tryParseCredentials(text: string): KeychainCredentials | null {
  try {
    const parsed = JSON.parse(text) as KeychainCredentials
    if (parsed.claudeAiOauth?.accessToken) {
      return parsed
    }
  } catch {
    // Not plain JSON, try hex decode
  }

  let hex = text.trim()
  if (hex.startsWith('0x') || hex.startsWith('0X')) {
    hex = hex.slice(2)
  }
  if (!isHexEncoded(hex)) {
    return null
  }

  try {
    const decoded = hexDecode(hex)
    const parsed = JSON.parse(decoded) as KeychainCredentials
    if (parsed.claudeAiOauth?.accessToken) {
      return parsed
    }
  } catch {
    // Invalid
  }

  return null
}

export function loadCredentials(configDirPath: string): LoadedCredentials | null {
  if (process.platform !== 'darwin') {
    return null
  }

  // Try credentials file first
  try {
    const filePath = join(configDirPath, '.credentials.json')
    const text = readFileSync(filePath, 'utf-8')
    const credentials = tryParseCredentials(text)
    if (credentials) {
      return { credentials, source: 'file' }
    }
  } catch {
    // File doesn't exist or can't be read
  }

  // Fallback to Keychain
  try {
    const suffix = computeKeychainSuffix(configDirPath)
    const service = `Claude Code-credentials${suffix}`
    const account = userInfo().username

    const output = execSync(`security find-generic-password -s "${service}" -a "${account}" -w`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim()

    const credentials = tryParseCredentials(output)
    if (credentials) {
      return { credentials, source: 'keychain' }
    }
  } catch {
    // Keychain entry doesn't exist
  }

  return null
}

export function saveCredentials(
  configDirPath: string,
  source: CredentialSource,
  credentials: KeychainCredentials
): void {
  // MUST use minified JSON — macOS `security -w` hex-encodes values with newlines,
  // which Claude Code can't read back, causing it to invalidate the session.
  const text = JSON.stringify(credentials)

  if (source === 'file') {
    try {
      writeFileSync(join(configDirPath, '.credentials.json'), text, 'utf-8')
    } catch {
      // Silent fail
    }
  } else {
    try {
      const suffix = computeKeychainSuffix(configDirPath)
      const service = `Claude Code-credentials${suffix}`
      const account = userInfo().username

      try {
        execSync(`security delete-generic-password -s "${service}" -a "${account}"`, {
          stdio: ['pipe', 'pipe', 'pipe']
        })
      } catch {
        // Entry may not exist
      }

      execSync(`security add-generic-password -s "${service}" -a "${account}" -w "${text}"`, {
        stdio: ['pipe', 'pipe', 'pipe']
      })
    } catch {
      // Silent fail
    }
  }
}
