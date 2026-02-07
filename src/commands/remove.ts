import * as p from '@clack/prompts'
import pc from 'picocolors'
import { removeAccountDir } from '../lib/accounts.js'
import { getAccount, removeAccount } from '../lib/config.js'

export async function removeCommand(name: string): Promise<void> {
  const existing = await getAccount(name)
  if (!existing) {
    p.log.error(pc.red(`Error: Account "${name}" not found.`))
    process.exit(1)
  }

  const confirmed = await p.confirm({
    message: `Are you sure you want to remove account '${name}'?`
  })

  if (p.isCancel(confirmed)) {
    p.cancel('Operation cancelled')
    process.exit(0)
  }

  if (confirmed) {
    await removeAccount(name)
    await removeAccountDir(name)
    p.log.success(`Account "${name}" removed.`)
  } else {
    p.log.info('Cancelled.')
  }
}
