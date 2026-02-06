import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'

export interface Account {
  name: string
  description: string
}

export interface Config {
  defaultAccount: string
  accounts: Account[]
}

const DEFAULT_CONFIG: Config = {
  defaultAccount: '',
  accounts: []
}

export function getConfigDir(): string {
  return join(homedir(), '.cc-subscription-switch')
}

export function getConfigPath(): string {
  return join(getConfigDir(), 'config.json')
}

export async function loadConfig(): Promise<Config> {
  try {
    const raw = await readFile(getConfigPath(), 'utf-8')
    const parsed = JSON.parse(raw) as Config
    return parsed
  } catch {
    return { ...DEFAULT_CONFIG, accounts: [] }
  }
}

export async function saveConfig(config: Config): Promise<void> {
  const dir = getConfigDir()
  await mkdir(dir, { recursive: true })
  await writeFile(getConfigPath(), JSON.stringify(config, null, 2), 'utf-8')
}

export async function addAccount(name: string, description: string): Promise<void> {
  const config = await loadConfig()
  const existing = config.accounts.find((a) => a.name === name)
  if (existing) {
    throw new Error(`Account "${name}" already exists`)
  }
  config.accounts.push({ name, description })
  await saveConfig(config)
}

export async function removeAccount(name: string): Promise<void> {
  const config = await loadConfig()
  const index = config.accounts.findIndex((a) => a.name === name)
  if (index === -1) {
    return
  }
  config.accounts.splice(index, 1)
  if (config.defaultAccount === name) {
    config.defaultAccount = ''
  }
  await saveConfig(config)
}

export async function getAccount(name: string): Promise<Account | undefined> {
  const config = await loadConfig()
  return config.accounts.find((a) => a.name === name)
}
