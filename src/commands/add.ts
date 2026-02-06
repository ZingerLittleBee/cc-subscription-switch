import { input } from "@inquirer/prompts";
import { getAccount, addAccount } from "../lib/config.js";
import { createAccountDir, getAccountDir } from "../lib/accounts.js";
import { spawnClaudeLogin } from "../lib/claude.js";

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

  console.log(`Running 'claude login' for account "${name}"...`);
  const exitCode = await spawnClaudeLogin(getAccountDir(name));

  if (exitCode === 0) {
    console.log(`Account "${name}" added and logged in successfully.`);
  } else {
    console.warn(
      `Warning: 'claude login' exited with code ${exitCode}. Account "${name}" was added but login may not have completed.`,
    );
  }
}
