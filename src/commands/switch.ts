import { select, input, Separator } from "@inquirer/prompts";
import { loadConfig, saveConfig } from "../lib/config.js";
import { getAccountDir } from "../lib/accounts.js";
import { checkClaudeInstalled, spawnClaude } from "../lib/claude.js";
import { addCommand } from "./add.js";
import { listCommand } from "./list.js";

export async function switchCommand(
  claudeArgs: string[],
): Promise<void> {
  const config = await loadConfig();

  // If no accounts, auto-enter add flow
  if (config.accounts.length === 0) {
    console.log("No accounts configured. Let's add one.");
    const name = await input({
      message: "Enter a name for the new account:",
    });
    await addCommand(name);
    return switchCommand(claudeArgs);
  }

  // Show interactive selector
  const choices = [
    ...config.accounts.map((account) => ({
      name: `${account.name}${account.description ? ` - ${account.description}` : ""}`,
      value: account.name,
    })),
    new Separator(),
    { name: "+ Add new account", value: "__add__" },
    { name: "\u2699 Manage accounts", value: "__manage__" },
  ];

  const selected = await select({
    message: "Select account:",
    choices,
    default: config.defaultAccount || undefined,
  });

  if (selected === "__add__") {
    const name = await input({
      message: "Enter a name for the new account:",
    });
    await addCommand(name);
    return switchCommand(claudeArgs);
  }

  if (selected === "__manage__") {
    await listCommand();
    return;
  }

  const selectedName = selected;

  // Check claude is installed
  const installed = await checkClaudeInstalled();
  if (!installed) {
    console.error(
      "Error: 'claude' CLI not found. Please install Claude Code first.",
    );
    process.exit(1);
  }

  // Set as default account and save
  config.defaultAccount = selectedName;
  await saveConfig(config);

  // Spawn claude with the account's config dir
  const configDir = getAccountDir(selectedName);
  const exitCode = await spawnClaude(configDir, claudeArgs);
  process.exit(exitCode);
}
