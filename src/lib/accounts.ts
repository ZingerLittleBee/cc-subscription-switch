import { mkdir, readdir, rm, stat } from "node:fs/promises";
import { join } from "node:path";
import { getConfigDir } from "./config.js";

export function getAccountDir(name: string): string {
  return join(getConfigDir(), "accounts", name);
}

export async function createAccountDir(name: string): Promise<void> {
  const dir = getAccountDir(name);
  await mkdir(dir, { recursive: true });
}

export async function removeAccountDir(name: string): Promise<void> {
  const dir = getAccountDir(name);
  await rm(dir, { recursive: true, force: true });
}

export async function validateAccountDir(name: string): Promise<boolean> {
  try {
    const dir = getAccountDir(name);
    const info = await stat(dir);
    return info.isDirectory();
  } catch {
    return false;
  }
}

export async function listAccountDirs(): Promise<string[]> {
  const accountsRoot = join(getConfigDir(), "accounts");
  try {
    const entries = await readdir(accountsRoot, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  } catch {
    return [];
  }
}
