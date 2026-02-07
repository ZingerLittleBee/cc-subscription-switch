import * as p from '@clack/prompts'
import pc from 'picocolors'
import { createAccountDir, getAccountDir, removeAccountDir } from '../lib/accounts.js'
import { spawnClaude } from '../lib/claude.js'
import { addAccount, getAccount } from '../lib/config.js'
import { promptSyncSettings } from './sync-settings.js'

export async function addCommand(name: string): Promise<void> {
  const existing = await getAccount(name)
  if (existing) {
    p.log.error(pc.red(`Error: Account "${name}" already exists.`))
    process.exit(1)
  }

  const description = await p.text({
    message: 'Account description (optional):',
    placeholder: '',
    defaultValue: ''
  })

  if (p.isCancel(description)) {
    p.cancel('Operation cancelled')
    process.exit(0)
  }

  // Create account directory first (needed for settings and login)
  await createAccountDir(name)

  // Prompt to sync settings before login
  await promptSyncSettings(name)

  const proceed = await p.select({
    message: 'Next, Claude will open for login. After completing login, type "/exit" in Claude to return here.',
    options: [{ label: 'I understand, continue', value: true }]
  })

  if (p.isCancel(proceed)) {
    await removeAccountDir(name)
    p.cancel('Operation cancelled')
    process.exit(0)
  }

  const exitCode = await spawnClaude(getAccountDir(name), [])

  // Only add account to config after successful login
  if (exitCode === 0) {
    await addAccount(name, description)
    p.log.success(`Account "${name}" added successfully.`)
  } else {
    // Clean up directory if login failed/cancelled
    await removeAccountDir(name)
    p.log.info('Account creation cancelled.')
  }
}
