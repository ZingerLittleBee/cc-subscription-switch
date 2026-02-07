# CCSS - Claude Code Subscription Switch

Language: 🇺🇸 English | [🇨🇳 简体中文](./README.zh.md)

A TUI tool for managing and switching between multiple Claude Code subscriptions on a single machine.

## Install

```bash
# npm
npm install -g cc-subscription-switch

# bun
bun install -g cc-subscription-switch
```

Or run directly without installing:

```bash
npx cc-subscription-switch
# or
bunx cc-subscription-switch
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
4. Sync skills directory (optional, if `~/.claude/skills/` exists):
   - **Symlink** (recommended) — shares the same directory, changes are reflected in all accounts
   - **Copy** — creates an independent copy
   - **Skip**
5. Claude opens for first-time login (onboarding)
6. Complete the login, then type `/exit` in Claude to return
7. Account is added after successful login

### Settings sync

CCSS supports syncing settings between accounts:

- **Common settings**: Shared settings stored at `~/.cc-subscription-switch/settings.json`
- **Global settings**: Your main Claude settings at `~/.claude/settings.json`

When syncing from global settings, account-specific fields are excluded:
- `accountId`, `userId`, `email`, `oauthAccount`, `primaryOrganization`, `env`

Use `ccss sync <name>` to configure settings for an existing account, or save current account settings as common.

### Skills sync

When adding an account or running `ccss sync <name>`, if `~/.claude/skills/` exists and is non-empty, you'll be prompted to sync the skills directory:

- **Symlink**: Creates a symbolic link to `~/.claude/skills/` — all accounts share the same skills, any changes are reflected everywhere.
- **Copy**: Creates an independent copy of the skills directory for this account.
- **Skip**: Don't sync skills.

## Development

```bash
bun run dev
```
