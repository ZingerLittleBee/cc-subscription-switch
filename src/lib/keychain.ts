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
