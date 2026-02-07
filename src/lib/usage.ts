import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { getAccountDir } from './accounts.js'
import { readKeychainCredentials } from './keychain.js'
import { ensureValidToken } from './token.js'

export interface UtilizationMetric {
  utilization: number
}

export interface ExtraUsageMetric {
  is_enabled: boolean
  used_credits: number | null
  monthly_limit: number | null
}

export interface UsageData {
  five_hour: UtilizationMetric
  seven_day: UtilizationMetric
  seven_day_sonnet: UtilizationMetric | null
  extra_usage: ExtraUsageMetric
}

interface UsageCache {
  data: UsageData
  fetchedAt: number
}

const USAGE_API = 'https://api.anthropic.com/api/oauth/usage'
const CACHE_TTL_MS = 5 * 60 * 1000

function getCachePath(accountName: string): string {
  return `${getAccountDir(accountName)}/.usage-cache.json`
}

async function readCache(accountName: string): Promise<UsageData | null> {
  try {
    const raw = await readFile(getCachePath(accountName), 'utf-8')
    const cache = JSON.parse(raw) as UsageCache
    if (Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
      return cache.data
    }
    return null
  } catch {
    return null
  }
}

async function writeCache(accountName: string, data: UsageData): Promise<void> {
  try {
    const path = getCachePath(accountName)
    await mkdir(dirname(path), { recursive: true })
    const cache: UsageCache = { data, fetchedAt: Date.now() }
    await writeFile(path, JSON.stringify(cache), 'utf-8')
  } catch {
    // Silent fail
  }
}

async function fetchUsage(token: string): Promise<UsageData | null> {
  try {
    const response = await fetch(USAGE_API, {
      headers: {
        Authorization: `Bearer ${token}`,
        'anthropic-beta': 'oauth-2025-04-20'
      }
    })
    if (!response.ok) {
      return null
    }
    return (await response.json()) as UsageData
  } catch {
    return null
  }
}

export async function getAccountUsage(accountName: string): Promise<UsageData | null> {
  if (process.platform !== 'darwin') {
    return null
  }

  // Check cache first
  const cached = await readCache(accountName)
  if (cached) {
    return cached
  }

  const configDirPath = getAccountDir(accountName)
  const credentials = readKeychainCredentials(configDirPath)
  if (!credentials) {
    return null
  }

  const token = await ensureValidToken(credentials)
  if (!token) {
    return null
  }

  const data = await fetchUsage(token)

  if (data) {
    await writeCache(accountName, data)
  }

  return data
}

export async function getAllAccountUsage(accountNames: string[]): Promise<Map<string, UsageData | null>> {
  const results = await Promise.all(
    accountNames.map(async (name) => {
      const usage = await getAccountUsage(name)
      return [name, usage] as const
    })
  )
  return new Map(results)
}
