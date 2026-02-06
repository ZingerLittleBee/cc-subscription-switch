import { select, confirm, editor } from "@inquirer/prompts";
import { getAccountDir } from "../lib/accounts.js";
import {
  loadGlobalSettings,
  loadAccountSettings,
  loadCommonSettings,
  saveAccountSettings,
  saveCommonSettings,
  filterSyncableSettings,
  formatSettingsForDisplay,
  parseSettingsFromInput,
  getCommonSettingsPath,
  type ClaudeSettings,
} from "../lib/settings.js";

export async function syncSettingsCommand(accountName: string): Promise<void> {
  const accountDir = getAccountDir(accountName);
  const commonSettings = await loadCommonSettings();
  const accountSettings = await loadAccountSettings(accountDir);
  const commonPath = getCommonSettingsPath();

  const choices = [
    ...(commonSettings
      ? [
          {
            name: `Sync from common settings (${commonPath})`,
            value: "common",
          },
        ]
      : []),
    {
      name: "Sync from global settings (~/.claude/settings.json)",
      value: "global",
    },
    { name: "Edit settings manually", value: "manual" },
    ...(accountSettings
      ? [
          {
            name: `Save current settings to common (${commonPath})`,
            value: "save-common",
          },
        ]
      : []),
    { name: "Skip", value: "skip" },
  ];

  const choice = await select({
    message: "How would you like to configure settings?",
    choices,
    loop: false,
  });

  if (choice === "skip") {
    return;
  }

  if (choice === "common") {
    await syncFromCommon(accountDir);
  } else if (choice === "global") {
    await syncFromGlobal(accountDir);
  } else if (choice === "manual") {
    await editManually(accountDir);
  } else if (choice === "save-common") {
    await saveAsCommon(accountDir);
  }
}

async function syncFromCommon(accountDir: string): Promise<void> {
  const commonSettings = await loadCommonSettings();

  if (!commonSettings) {
    console.log("No common settings found.");
    return;
  }

  console.log("\nCommon settings to apply:\n");
  console.log(formatSettingsForDisplay(commonSettings));
  console.log();

  const shouldSync = await confirm({
    message: "Apply these settings to this account?",
    default: true,
  });

  if (shouldSync) {
    await saveAccountSettings(accountDir, commonSettings);
    console.log("Settings synced successfully.");
  }
}

async function syncFromGlobal(accountDir: string): Promise<void> {
  const globalSettings = await loadGlobalSettings();

  if (!globalSettings) {
    console.log("No global settings found at ~/.claude/settings.json");
    const shouldEdit = await confirm({
      message: "Would you like to create settings manually?",
      default: false,
    });
    if (shouldEdit) {
      await editManually(accountDir);
    }
    return;
  }

  const syncableSettings = filterSyncableSettings(globalSettings);

  console.log(
    "\nSettings to sync (account-specific fields and env excluded):\n",
  );
  console.log(formatSettingsForDisplay(syncableSettings));
  console.log();

  const shouldSync = await confirm({
    message: "Apply these settings to this account?",
    default: true,
  });

  if (shouldSync) {
    await saveAccountSettings(accountDir, syncableSettings);
    console.log("Settings synced successfully.");

    await promptSaveAsCommon(syncableSettings);
  }
}

async function editManually(accountDir: string): Promise<void> {
  const existingSettings = await loadAccountSettings(accountDir);
  const initialContent = existingSettings
    ? formatSettingsForDisplay(existingSettings)
    : "{\n  \n}";

  const edited = await editor({
    message: "Edit settings (JSON format):",
    default: initialContent,
    postfix: ".json",
  });

  const parsed = parseSettingsFromInput(edited);

  if (!parsed) {
    console.error("Invalid JSON. Settings not saved.");
    return;
  }

  await saveAccountSettings(accountDir, parsed as ClaudeSettings);
  console.log("Settings saved successfully.");

  await promptSaveAsCommon(parsed as ClaudeSettings);
}

async function saveAsCommon(accountDir: string): Promise<void> {
  const accountSettings = await loadAccountSettings(accountDir);

  if (!accountSettings) {
    console.log("No settings found for this account.");
    return;
  }

  const syncableSettings = filterSyncableSettings(accountSettings);
  await doSaveAsCommon(syncableSettings);
}

async function promptSaveAsCommon(settings: ClaudeSettings): Promise<void> {
  const commonPath = getCommonSettingsPath();
  const shouldSave = await confirm({
    message: `Save as common settings? (${commonPath})`,
    default: false,
  });

  if (shouldSave) {
    const syncableSettings = filterSyncableSettings(settings);
    await saveCommonSettings(syncableSettings);
    console.log("Common settings saved successfully.");
  }
}

async function doSaveAsCommon(settings: ClaudeSettings): Promise<void> {
  const commonPath = getCommonSettingsPath();

  console.log("\nSettings to save as common:\n");
  console.log(formatSettingsForDisplay(settings));
  console.log();

  const shouldSave = await confirm({
    message: `Save to ${commonPath}?`,
    default: true,
  });

  if (shouldSave) {
    await saveCommonSettings(settings);
    console.log("Common settings saved successfully.");
  }
}

export async function promptSyncSettings(accountName: string): Promise<void> {
  const commonSettings = await loadCommonSettings();

  if (commonSettings) {
    const shouldSync = await confirm({
      message: "Apply common settings to this account?",
      default: true,
    });

    if (shouldSync) {
      const accountDir = getAccountDir(accountName);
      await saveAccountSettings(accountDir, commonSettings);
      console.log("Common settings applied.");
      return;
    }
  }

  const shouldConfigure = await confirm({
    message: "Would you like to configure settings for this account?",
    default: false,
  });

  if (shouldConfigure) {
    await syncSettingsCommand(accountName);
  }
}
