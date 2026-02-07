import * as p from '@clack/prompts'
import pc from 'picocolors'
import { loadConfig } from '../lib/config.js'

export async function whoamiCommand(): Promise<void> {
  const config = await loadConfig()
  const defaultName = config.defaultAccount

  if (!defaultName) {
    p.log.info('No default account set.')
    return
  }

  const account = config.accounts.find((a) => a.name === defaultName)
  if (!account) {
    p.log.info('No default account set.')
    return
  }

  const desc = account.description ? pc.dim(` - ${account.description}`) : ''
  p.log.info(`Current account: ${pc.cyan(account.name)}${desc}`)
}
