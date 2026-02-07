import * as p from '@clack/prompts'
import pc from 'picocolors'
import { validateAccountDir } from '../lib/accounts.js'
import { loadConfig } from '../lib/config.js'

export async function listCommand(): Promise<void> {
  const config = await loadConfig()

  if (config.accounts.length === 0) {
    p.log.info("No accounts configured. Run 'ccss add <name>' to add one.")
    return
  }

  p.log.step(pc.bold('Accounts:'))
  for (const account of config.accounts) {
    const isDefault = account.name === config.defaultAccount
    const dirValid = await validateAccountDir(account.name)
    const marker = isDefault ? pc.green('* ') : '  '
    const status = dirValid ? pc.green('[valid]') : pc.red('[missing]')
    const desc = account.description ? pc.dim(` - ${account.description}`) : ''
    p.log.message(`  ${marker}${pc.cyan(account.name)}${desc}  ${status}`)
  }
}
