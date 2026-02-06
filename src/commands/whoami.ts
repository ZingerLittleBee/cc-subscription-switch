import { loadConfig } from "../lib/config.js";
import { getAccountDir } from "../lib/accounts.js";
import { spawnClaudeWhoami } from "../lib/claude.js";

export async function whoamiCommand(): Promise<void> {
  const config = await loadConfig();
  const defaultName = config.defaultAccount;

  if (!defaultName) {
    console.log("No default account set.");
    return;
  }

  const account = config.accounts.find((a) => a.name === defaultName);
  if (!account) {
    console.log("No default account set.");
    return;
  }

  const desc = account.description ? ` - ${account.description}` : "";
  console.log(`Current account: ${account.name}${desc}`);

  await spawnClaudeWhoami(getAccountDir(account.name));
}
