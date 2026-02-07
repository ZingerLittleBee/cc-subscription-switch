# Changelog

## [1.2.0] - 2026-02-08

### Added

- `ccss usage` — show usage metrics (5-hour / 7-day / 7-day sonnet utilization, extra credits) for the current account
  - `ccss usage --all` — show usage for all accounts
- Inline usage progress bars in `ccss list`, `ccss whoami`, and the interactive account selector
- OAuth token auto-refresh — expired tokens are refreshed transparently via the Anthropic OAuth endpoint
- Credential loading supports both `.credentials.json` file and macOS Keychain, with automatic source detection
- Usage data cached for 5 minutes at `~/.cc-subscription-switch/accounts/<name>/.usage-cache.json`
- Color-coded progress bars: green (0–50%), yellow (50–80%), red (80–100%)

## [1.1.0] - 2026-02-07

### Added

- Migrate TUI from `@inquirer/prompts` to `@clack/prompts` + `picocolors` for a polished terminal experience
  - Bordered prompts (`p.note`), semantic colors, and structured log output (`p.log.*`)
  - Account names in `cyan`, default marker in `green`, status in `green`/`red`, descriptions in `dim`
- Add `src/lib/editor.ts` — custom `$EDITOR`-based editing since `@clack/prompts` lacks a built-in editor prompt
- Add skills directory sync prompt during account setup — symlink (recommended), copy, or skip

### Changed

- Replace cancel handling: global `ExitPromptError` catch → per-prompt `p.isCancel()` with `p.cancel('Operation cancelled')`
- Login confirmation prompt changed from Yes/No to single "I understand, continue" select
- `select()` options use `label` + `hint` instead of `name`; action items styled with `pc.dim()`
- Settings preview uses `p.note(content, title)` with bordered display
- `confirm({ default })` → `p.confirm({ initialValue })`

### Removed

- `@inquirer/prompts` dependency
- `Separator` usage (replaced by `pc.dim()` styled labels)
- Global `ExitPromptError` uncaught exception handler in `src/index.ts`

## [1.0.0] - 2026-02-06

### Added

- Interactive account selector with add/remove/exit actions
- `ccss add <name>` — add new account with optional description and Claude login
- `ccss remove <name>` — remove account with confirmation prompt
- `ccss list` — list all accounts with validity status
- `ccss whoami` — show current default account
- `ccss config` — show config directory path
- `ccss sync <name>` — sync settings from common/global/manual sources
- Settings sync with common config support
- Pass-through args to Claude without `--` separator
- GitHub Actions workflow for npm publishing
- Biome for code formatting and linting
