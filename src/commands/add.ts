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

  console.log(`\nSetting up authentication for account "${name}"...`);
  console.log("Please follow the prompts to complete login.\n");
  const exitCode = await spawnClaudeLogin(getAccountDir(name));

  if (exitCode === 0) {
    console.log(`\nAccount "${name}" added and authenticated successfully.`);
  } else {
    console.warn(
      `\nWarning: Authentication exited with code ${exitCode}. Account "${name}" was added but login may not have completed.`,
    );
  }
}
