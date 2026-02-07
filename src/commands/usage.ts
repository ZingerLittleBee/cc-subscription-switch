import { log } from '@clack/prompts'
import pc from 'picocolors'
import { loadConfig } from '../lib/config.js'
import { renderFullUsage } from '../lib/display.js'
import { getAccountUsage } from '../lib/usage.js'

export async function usageCommand(showAll: boolean): Promise<void> {
  if (process.platform !== 'darwin') {
    log.warn('Usage metrics are only supported on macOS.')
    return
  }

  const config = await loadConfig()

  if (config.accounts.length === 0) {
    log.info("No accounts configured. Run 'ccss add <name>' to add one.")
    return
  }

  if (showAll) {
    for (const account of config.accounts) {
      const isDefault = account.name === config.defaultAccount
      const marker = isDefault ? pc.green('* ') : '  '
      log.step(`${marker}${pc.cyan(account.name)}`)
      const usage = await getAccountUsage(account.name)
      if (usage) {
        log.message(renderFullUsage(usage))
      } else {
        log.message(pc.dim('  Could not retrieve usage data. Token may be expired, try re-login.'))
      }
    }
    return
  }

  const defaultName = config.defaultAccount
  if (!defaultName) {
    log.info('No default account set.')
    return
  }

  const account = config.accounts.find((a) => a.name === defaultName)
  if (!account) {
    log.info('No default account set.')
    return
  }

  log.step(`${pc.cyan(account.name)}`)
  const usage = await getAccountUsage(account.name)
  if (usage) {
    log.message(renderFullUsage(usage))
  } else {
    log.message(pc.dim('Could not retrieve usage data. Token may be expired, try re-login.'))
  }
}
