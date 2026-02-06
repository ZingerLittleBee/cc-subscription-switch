# CCSS - Claude Code Subscription Switch

## Overview

A TypeScript TUI tool for managing and switching between multiple Claude Code subscriptions on a single machine. Users select an account interactively, and the tool spawns Claude with the correct `CLAUDE_CONFIG_DIR`.

## Core Interaction

### Default command: `ccss [-- claude-args...]`

Interactive account selector:

```
$ ccss -- -p "help me"

  Claude Subscription Switch

? Select account: (Use arrow keys)
> work-account (user@company.com)
  personal (me@gmail.com)
  ----------
  + Add new account
  * Manage accounts
```

After selection, spawns `claude` with the chosen account's config dir and passes through all CLI arguments after `--`.

### Subcommands

- `ccss add <name>` - Add account: creates directory, spawns `claude login`
- `ccss remove <name>` - Remove account (with confirmation)
- `ccss list` - List all accounts and status
- `ccss whoami` - Show current/last used account info

## Directory Structure

```
~/.cc-subscription-switch/
  config.json
  accounts/
    work-account/      # Used as CLAUDE_CONFIG_DIR
    personal/          # Used as CLAUDE_CONFIG_DIR
```

### config.json

```json
{
  "defaultAccount": "work-account",
  "accounts": [
    { "name": "work-account", "description": "Work account" },
    { "name": "personal", "description": "Personal account" }
  ]
}
```

## Tech Stack

- TypeScript + Node.js
- `@inquirer/prompts` - TUI interaction (select, input, confirm)
- `commander` - CLI subcommands and argument parsing
- `tsx` for dev, `tsup` for build
- `bin` field in package.json registers `ccss` command

## Project Structure

```
src/
  index.ts              # Entry point, commander command definitions
  commands/
    switch.ts           # Default: select account and launch claude
    add.ts              # Add account
    remove.ts           # Remove account
    list.ts             # List accounts
    whoami.ts           # Show current account
  lib/
    config.ts           # Read/write config.json
    accounts.ts         # Account directory management (create/delete/validate)
    claude.ts           # Spawn claude process (set env, pass through args)
```

## Key Implementation Details

- `claude.ts` uses `child_process.spawn` with `env.CLAUDE_CONFIG_DIR` pointing to account directory, `stdio: 'inherit'` to maintain terminal interactivity
- CLI arg passthrough: everything after `--` in `ccss -- --model sonnet -p "xxx"` is forwarded to `claude`
- First run with no accounts auto-enters the `add` flow

## Error Handling

- Claude CLI not installed: detect `claude` in PATH at startup, show install instructions
- Account directory missing/corrupted: validate on startup, mark abnormal accounts
- `claude login` failure: capture exit code, prompt retry or delete
- Duplicate account names: reject during `add`

## Edge Cases

- No accounts: auto-enter add flow
- Single account: skip selection, launch directly (use `--select` to force picker)
- Missing/malformed config.json: auto-initialize to empty config
