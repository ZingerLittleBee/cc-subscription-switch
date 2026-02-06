import { input, select } from '@inquirer/prompts'
import { createAccountDir, getAccountDir, removeAccountDir } from '../lib/accounts.js'
import { spawnClaude } from '../lib/claude.js'
import { addAccount, getAccount } from '../lib/config.js'
import { promptSyncSettings } from './sync-settings.js'

export async function addCommand(name: string): Promise<void> {
  const existing = await getAccount(name)
  if (existing) {
    console.error(`Error: Account "${name}" already exists.`)
    process.exit(1)
  }

  const description = await input({
    message: 'Account description (optional):'
  })

  // Create account directory first (needed for settings and login)
  await createAccountDir(name)

  // Prompt to sync settings before login
  await promptSyncSettings(name)

  const proceed = await select({
    message: 'Next, Claude will open for login. After completing login, type "/exit" in Claude to return here.',
    choices: [
      { name: 'Continue', value: true },
      { name: 'Cancel', value: false }
    ],
    loop: false
  })

  if (!proceed) {
    await removeAccountDir(name)
    console.log('\nAccount creation cancelled.')
    return
  }

  const exitCode = await spawnClaude(getAccountDir(name), [])

  // Only add account to config after successful login
  if (exitCode === 0) {
    await addAccount(name, description)
    console.log(`\nAccount "${name}" added successfully.`)
  } else {
    // Clean up directory if login failed/cancelled
    await removeAccountDir(name)
    console.log('\nAccount creation cancelled.')
  }
}
