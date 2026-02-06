import { input } from "@inquirer/prompts";
import { getAccount, addAccount } from "../lib/config.js";
import { createAccountDir, getAccountDir } from "../lib/accounts.js";
import { spawnClaude } from "../lib/claude.js";
import { promptSyncSettings } from "./sync-settings.js";

export async function addCommand(name: string): Promise<void> {
  const existing = await getAccount(name);
  if (existing) {
    console.error(`Error: Account "${name}" already exists.`);
    process.exit(1);
  }

  const description = await input({
    message: "Account description (optional):",
  });

  await createAccountDir(name);
  await addAccount(name, description);

  // Prompt to sync settings before login
  await promptSyncSettings(name);

  await input({
    message:
      'Next, Claude will open for login. After completing login, type "/exit" in Claude to return here. Press Enter to proceed:',
  });

  await spawnClaude(getAccountDir(name), []);

  console.log(`\nAccount "${name}" added successfully.`);
}
