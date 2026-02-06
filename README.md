# CCSS - Claude Code Subscription Switch

A TUI tool for managing and switching between multiple Claude Code subscriptions on a single machine.

## Install

```bash
bun install
bun run build
bun link
```

## Usage

### Interactive account selector

```bash
# Select account and launch Claude
ccss

# Pass arguments to Claude
ccss -p "help me"
ccss --model sonnet
ccss --dangerously-skip-permissions
```

### Account management

```bash
# Add a new account
ccss add <name>

# Remove an account
ccss remove <name>

# List all accounts
ccss list

# Show current account
ccss whoami

# Show config directory path
ccss config

# Sync settings for an account
ccss sync <name>
```

## How it works

Each account's Claude configuration is stored in an isolated directory under `~/.cc-subscription-switch/accounts/<name>/`. When you select an account, CCSS launches Claude with `CLAUDE_CONFIG_DIR` pointing to that account's directory.

### Adding an account

1. Run `ccss add <name>`
2. Enter an optional description
3. Configure settings (optional):
   - Apply common settings from `~/.cc-subscription-switch/settings.json`
   - Sync from global settings `~/.claude/settings.json` (excludes account-specific fields and env)
   - Edit settings manually
4. Claude opens for first-time login (onboarding)
5. Complete the login, then type `/exit` in Claude to return
6. Account is added after successful login

### Settings sync

CCSS supports syncing settings between accounts:

- **Common settings**: Shared settings stored at `~/.cc-subscription-switch/settings.json`
- **Global settings**: Your main Claude settings at `~/.claude/settings.json`

When syncing from global settings, account-specific fields are excluded:
- `accountId`, `userId`, `email`, `oauthAccount`, `primaryOrganization`, `env`

Use `ccss sync <name>` to configure settings for an existing account, or save current account settings as common.

## Development

```bash
bun run dev
```
