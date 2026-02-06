import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";
import { getConfigDir } from "./config.js";

export interface ClaudeSettings {
  [key: string]: unknown;
}

// Fields that should NOT be synced (account-specific)
const ACCOUNT_SPECIFIC_FIELDS = [
  "accountId",
  "userId",
  "email",
  "oauthAccount",
  "primaryOrganization",
  "env",
];

export function getGlobalSettingsPath(): string {
  return join(homedir(), ".claude", "settings.json");
}

export function getAccountSettingsPath(accountDir: string): string {
  return join(accountDir, "settings.json");
}

export function getCommonSettingsPath(): string {
  return join(getConfigDir(), "settings.json");
}

export async function loadGlobalSettings(): Promise<ClaudeSettings | null> {
  try {
    const content = await readFile(getGlobalSettingsPath(), "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function loadAccountSettings(
  accountDir: string,
): Promise<ClaudeSettings | null> {
  try {
    const content = await readFile(getAccountSettingsPath(accountDir), "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function saveAccountSettings(
  accountDir: string,
  settings: ClaudeSettings,
): Promise<void> {
  const path = getAccountSettingsPath(accountDir);
  await writeFile(path, JSON.stringify(settings, null, 2));
}

export async function loadCommonSettings(): Promise<ClaudeSettings | null> {
  try {
    const content = await readFile(getCommonSettingsPath(), "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function saveCommonSettings(
  settings: ClaudeSettings,
): Promise<void> {
  const path = getCommonSettingsPath();
  await writeFile(path, JSON.stringify(settings, null, 2));
}

export function filterSyncableSettings(settings: ClaudeSettings): ClaudeSettings {
  const filtered: ClaudeSettings = {};
  for (const [key, value] of Object.entries(settings)) {
    if (!ACCOUNT_SPECIFIC_FIELDS.includes(key)) {
      filtered[key] = value;
    }
  }
  return filtered;
}

export function formatSettingsForDisplay(settings: ClaudeSettings): string {
  return JSON.stringify(settings, null, 2);
}

export function parseSettingsFromInput(input: string): ClaudeSettings | null {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}
