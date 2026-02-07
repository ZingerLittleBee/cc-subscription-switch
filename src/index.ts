#!/usr/bin/env node

import { Command } from 'commander'
import { addCommand } from './commands/add.js'
import { listCommand } from './commands/list.js'
import { removeCommand } from './commands/remove.js'
import { switchCommand } from './commands/switch.js'
import { syncSettingsCommand } from './commands/sync-settings.js'
import { usageCommand } from './commands/usage.js'
import { whoamiCommand } from './commands/whoami.js'
import { getConfigDir } from './lib/config.js'

const program = new Command()

program
  .name('ccss')
  .description('Claude Code Subscription Switch')
  .version('1.1.0')
  .argument('[args...]', 'arguments to pass to claude')
  .allowUnknownOption()
  .passThroughOptions()

program.action(async (claudeArgs: string[]) => {
  await switchCommand(claudeArgs)
})

program
  .command('add <name>')
  .description('Add a new account')
  .action(async (name: string) => {
    await addCommand(name)
  })

program
  .command('remove <name>')
  .description('Remove an account')
  .action(async (name: string) => {
    await removeCommand(name)
  })

program
  .command('list')
  .description('List all accounts')
  .action(async () => {
    await listCommand()
  })

program
  .command('whoami')
  .description('Show current account')
  .action(async () => {
    await whoamiCommand()
  })

program
  .command('config')
  .description('Show config directory path')
  .action(() => {
    console.log(getConfigDir())
  })

program
  .command('sync <name>')
  .description('Sync settings for an account')
  .action(async (name: string) => {
    await syncSettingsCommand(name)
  })

program
  .command('usage')
  .description('Show usage metrics for accounts')
  .option('--all', 'Show usage for all accounts', false)
  .action(async (options: { all: boolean }) => {
    await usageCommand(options.all)
  })

program.parse()
