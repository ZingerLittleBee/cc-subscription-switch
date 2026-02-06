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
```

## How it works

Each account's Claude configuration is stored in an isolated directory under `~/.cc-subscription-switch/accounts/<name>/`. When you select an account, CCSS launches Claude with `CLAUDE_CONFIG_DIR` pointing to that account's directory.

### Adding an account

1. Run `ccss add <name>`
2. Enter an optional description
3. Claude opens for first-time login (onboarding)
4. Complete the login, then type `/exit` in Claude to return
5. Account is ready to use

## Development

```bash
bun run dev
```
