import { validateAccountDir } from '../lib/accounts.js'
import { loadConfig } from '../lib/config.js'

export async function listCommand(): Promise<void> {
  const config = await loadConfig()

  if (config.accounts.length === 0) {
    console.log("No accounts configured. Run 'ccss add <name>' to add one.")
    return
  }

  console.log('Accounts:')
  for (const account of config.accounts) {
    const isDefault = account.name === config.defaultAccount
    const dirValid = await validateAccountDir(account.name)
    const marker = isDefault ? '* ' : '  '
    const status = dirValid ? '[valid]' : '[missing]'
    const desc = account.description ? ` - ${account.description}` : ''
    console.log(`  ${marker}${account.name}${desc}  ${status}`)
  }
}
