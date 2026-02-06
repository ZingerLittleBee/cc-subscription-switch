# CCSS - Claude Code Subscription Switch

Language: [🇺🇸 English](./README.md) | 🇨🇳 简体中文

一个用于在单台机器上管理和切换多个 Claude Code 订阅账号的 TUI 工具。

## 安装

```bash
# npm
npm install -g cc-subscription-switch

# bun
bun install -g cc-subscription-switch
```

或者无需安装直接运行：

```bash
npx cc-subscription-switch
# 或
bunx cc-subscription-switch
```

## 使用

### 交互式账号选择

```bash
# 选择账号并启动 Claude
ccss

# 传递参数给 Claude
ccss -p "help me"
ccss --model sonnet
ccss --dangerously-skip-permissions
```

### 账号管理

```bash
# 添加新账号
ccss add <name>

# 删除账号
ccss remove <name>

# 列出所有账号
ccss list

# 显示当前账号
ccss whoami

# 显示配置目录路径
ccss config

# 同步账号设置
ccss sync <name>
```

## 工作原理

每个账号的 Claude 配置存储在 `~/.cc-subscription-switch/accounts/<name>/` 的独立目录下。选择账号时，CCSS 会将 `CLAUDE_CONFIG_DIR` 指向该账号的目录来启动 Claude。

### 添加账号

1. 运行 `ccss add <name>`
2. 输入可选的描述信息
3. 配置设置（可选）：
   - 应用 `~/.cc-subscription-switch/settings.json` 中的通用设置
   - 从全局设置 `~/.claude/settings.json` 同步（排除账号特有字段和 env）
   - 手动编辑设置
4. Claude 会打开进行首次登录（引导流程）
5. 完成登录后，在 Claude 中输入 `/exit` 返回
6. 登录成功后账号即添加完成

### 设置同步

CCSS 支持在账号之间同步设置：

- **通用设置**：存储在 `~/.cc-subscription-switch/settings.json` 的共享设置
- **全局设置**：位于 `~/.claude/settings.json` 的主 Claude 设置

从全局设置同步时，以下账号特有字段会被排除：
- `accountId`、`userId`、`email`、`oauthAccount`、`primaryOrganization`、`env`

使用 `ccss sync <name>` 为已有账号配置设置，或将当前账号的设置保存为通用设置。

## 开发

```bash
bun run dev
```
