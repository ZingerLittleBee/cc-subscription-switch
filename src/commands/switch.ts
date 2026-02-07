import * as p from '@clack/prompts'
import pc from 'picocolors'
import { getAccountDir } from '../lib/accounts.js'
import { checkClaudeInstalled, spawnClaude } from '../lib/claude.js'
import { loadConfig, saveConfig } from '../lib/config.js'
import { renderInlineUsage } from '../lib/display.js'
import { getAllAccountUsage } from '../lib/usage.js'
import { addCommand } from './add.js'
import { removeCommand } from './remove.js'

export async function switchCommand(claudeArgs: string[]): Promise<void> {
  const config = await loadConfig()

  // If no accounts, auto-enter add flow
  if (config.accounts.length === 0) {
    p.log.info("No accounts configured. Let's add one.")
    const name = await p.text({
      message: 'Enter a name for the new account:',
      validate: (value) => {
        if (!value.trim()) return 'Account name is required'
      }
    })

    if (p.isCancel(name)) {
      p.cancel('Operation cancelled')
      process.exit(0)
    }

    await addCommand(name)
    p.log.step('Please select an account to start:')
    return switchCommand(claudeArgs)
  }

  // Fetch usage for all accounts
  const accountNames = config.accounts.map((a) => a.name)
  const usageMap = await getAllAccountUsage(accountNames)

  // Show interactive selector
  const options = [
    ...config.accounts.map((account) => {
      const usage = usageMap.get(account.name)
      const usageStr = usage ? renderInlineUsage(usage) : ''
      const baseHint = account.description || ''
      const hint = [baseHint, usageStr].filter(Boolean).join('  ') || undefined
      return {
        label: account.name,
        value: account.name,
        hint
      }
    }),
    { label: pc.dim('+ Add new account'), value: '__add__', hint: 'action' },
    { label: pc.dim('\u2699 Remove account'), value: '__remove__', hint: 'action' },
    { label: pc.dim('✗ Exit'), value: '__exit__', hint: 'action' }
  ]

  const selected = await p.select({
    message: 'Select account:',
    options,
    initialValue: config.defaultAccount || undefined
  })

  if (p.isCancel(selected)) {
    p.cancel('Operation cancelled')
    process.exit(0)
  }

  if (selected === '__exit__') {
    process.exit(0)
  }

  if (selected === '__add__') {
    const name = await p.text({
      message: 'Enter a name for the new account:',
      validate: (value) => {
        if (!value.trim()) return 'Account name is required'
      }
    })

    if (p.isCancel(name)) {
      p.cancel('Operation cancelled')
      process.exit(0)
    }

    await addCommand(name)
    p.log.step('Please select an account to start:')
    return switchCommand(claudeArgs)
  }

  if (selected === '__remove__') {
    const removeOptions = [
      ...config.accounts.map((account) => ({
        label: account.name,
        value: account.name,
        hint: account.description || undefined
      })),
      { label: pc.dim('← Back'), value: '__back__', hint: 'action' }
    ]

    const accountToRemove = await p.select({
      message: 'Select account to remove:',
      options: removeOptions
    })

    if (p.isCancel(accountToRemove)) {
      p.cancel('Operation cancelled')
      process.exit(0)
    }

    if (accountToRemove !== '__back__') {
      await removeCommand(accountToRemove)
    }
    return switchCommand(claudeArgs)
  }

  const selectedName = selected

  // Check claude is installed
  const installed = await checkClaudeInstalled()
  if (!installed) {
    p.log.error(pc.red("Error: 'claude' CLI not found. Please install Claude Code first."))
    process.exit(1)
  }

  // Set as default account and save
  config.defaultAccount = selectedName
  await saveConfig(config)

  // Spawn claude with the account's config dir
  const configDir = getAccountDir(selectedName)
  const exitCode = await spawnClaude(configDir, claudeArgs)
  process.exit(exitCode)
}
