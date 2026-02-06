import { confirm } from '@inquirer/prompts'
import { removeAccountDir } from '../lib/accounts.js'
import { getAccount, removeAccount } from '../lib/config.js'

export async function removeCommand(name: string): Promise<void> {
  const existing = await getAccount(name)
  if (!existing) {
    console.error(`Error: Account "${name}" not found.`)
    process.exit(1)
  }

  const confirmed = await confirm({
    message: `Are you sure you want to remove account '${name}'?`,
    default: false
  })

  if (confirmed) {
    await removeAccount(name)
    await removeAccountDir(name)
    console.log(`Account "${name}" removed.`)
  } else {
    console.log('Cancelled.')
  }
}
