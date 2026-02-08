import * as p from '@clack/prompts'
import pc from 'picocolors'
import { getAccountDir } from '../lib/accounts.js'
import { openEditor } from '../lib/editor.js'
import { copySkills, globalSkillsExist, symlinkSkills } from '../lib/skills.js'
import {
  type ClaudeSettings,
  filterSyncableSettings,
  formatSettingsForDisplay,
  getCommonSettingsPath,
  loadAccountSettings,
  loadCommonSettings,
  loadGlobalSettings,
  parseSettingsFromInput,
  saveAccountSettings,
  saveCommonSettings
} from '../lib/settings.js'

export async function syncSettingsCommand(accountName: string): Promise<void> {
  const accountDir = getAccountDir(accountName)
  const commonSettings = await loadCommonSettings()
  const accountSettings = await loadAccountSettings(accountDir)
  const commonPath = getCommonSettingsPath()

  const options = [
    ...(commonSettings
      ? [
          {
            label: 'Sync from common settings',
            value: 'common',
            hint: commonPath
          }
        ]
      : []),
    {
      label: 'Sync from global settings',
      value: 'global',
      hint: '~/.claude/settings.json'
    },
    { label: 'Edit settings manually', value: 'manual' },
    ...(accountSettings
      ? [
          {
            label: 'Save current settings to common',
            value: 'save-common',
            hint: commonPath
          }
        ]
      : []),
    { label: 'Skip', value: 'skip' }
  ]

  const choice = await p.select({
    message: 'How would you like to configure settings?',
    options
  })

  if (p.isCancel(choice)) {
    p.cancel('Operation cancelled')
    process.exit(0)
  }

  if (choice === 'skip') {
    return
  }

  if (choice === 'common') {
    await syncFromCommon(accountDir)
  } else if (choice === 'global') {
    await syncFromGlobal(accountDir)
  } else if (choice === 'manual') {
    await editManually(accountDir)
  } else if (choice === 'save-common') {
    await saveAsCommon(accountDir)
  }
}

async function syncFromCommon(accountDir: string): Promise<void> {
  const commonSettings = await loadCommonSettings()

  if (!commonSettings) {
    p.log.info('No common settings found.')
    return
  }

  p.note(formatSettingsForDisplay(commonSettings), 'Common settings to apply')

  const shouldSync = await p.confirm({
    message: 'Apply these settings to this account?',
    initialValue: true
  })

  if (p.isCancel(shouldSync)) {
    p.cancel('Operation cancelled')
    process.exit(0)
  }

  if (shouldSync) {
    await saveAccountSettings(accountDir, commonSettings)
    p.log.success('Settings synced successfully.')
  }
}

async function syncFromGlobal(accountDir: string): Promise<void> {
  const globalSettings = await loadGlobalSettings()

  if (!globalSettings) {
    p.log.info('No global settings found at ~/.claude/settings.json')
    const shouldEdit = await p.confirm({
      message: 'Would you like to create settings manually?'
    })

    if (p.isCancel(shouldEdit)) {
      p.cancel('Operation cancelled')
      process.exit(0)
    }

    if (shouldEdit) {
      await editManually(accountDir)
    }
    return
  }

  const syncableSettings = filterSyncableSettings(globalSettings)

  p.note(formatSettingsForDisplay(syncableSettings), 'Settings to sync (account-specific fields and env excluded)')

  const shouldSync = await p.confirm({
    message: 'Apply these settings to this account?',
    initialValue: true
  })

  if (p.isCancel(shouldSync)) {
    p.cancel('Operation cancelled')
    process.exit(0)
  }

  if (shouldSync) {
    await saveAccountSettings(accountDir, syncableSettings)
    p.log.success('Settings synced successfully.')

    await promptSaveAsCommon(syncableSettings)
  }
}

async function editManually(accountDir: string): Promise<void> {
  const existingSettings = await loadAccountSettings(accountDir)
  const initialContent = existingSettings ? formatSettingsForDisplay(existingSettings) : '{\n  \n}'

  const edited = await openEditor(initialContent, '.json')

  const parsed = parseSettingsFromInput(edited)

  if (!parsed) {
    p.log.error(pc.red('Invalid JSON. Settings not saved.'))
    return
  }

  await saveAccountSettings(accountDir, parsed as ClaudeSettings)
  p.log.success('Settings saved successfully.')

  await promptSaveAsCommon(parsed as ClaudeSettings)
}

async function saveAsCommon(accountDir: string): Promise<void> {
  const accountSettings = await loadAccountSettings(accountDir)

  if (!accountSettings) {
    p.log.info('No settings found for this account.')
    return
  }

  const syncableSettings = filterSyncableSettings(accountSettings)
  await doSaveAsCommon(syncableSettings)
}

async function promptSaveAsCommon(settings: ClaudeSettings): Promise<void> {
  const commonPath = getCommonSettingsPath()
  const shouldSave = await p.confirm({
    message: `Save as common settings? (${commonPath})`
  })

  if (p.isCancel(shouldSave)) {
    p.cancel('Operation cancelled')
    process.exit(0)
  }

  if (shouldSave) {
    const syncableSettings = filterSyncableSettings(settings)
    await saveCommonSettings(syncableSettings)
    p.log.success('Common settings saved successfully.')
  }
}

async function doSaveAsCommon(settings: ClaudeSettings): Promise<void> {
  const commonPath = getCommonSettingsPath()

  p.note(formatSettingsForDisplay(settings), 'Settings to save as common')

  const shouldSave = await p.confirm({
    message: `Save to ${commonPath}?`,
    initialValue: true
  })

  if (p.isCancel(shouldSave)) {
    p.cancel('Operation cancelled')
    process.exit(0)
  }

  if (shouldSave) {
    await saveCommonSettings(settings)
    p.log.success('Common settings saved successfully.')
  }
}

export async function promptSyncSettings(accountName: string): Promise<void> {
  const commonSettings = await loadCommonSettings()
  const commonPath = getCommonSettingsPath()
  const accountDir = getAccountDir(accountName)

  const options = [
    ...(commonSettings
      ? [
          {
            label: 'Apply common settings',
            value: 'common',
            hint: commonPath
          }
        ]
      : []),
    {
      label: 'Sync from global settings',
      value: 'global',
      hint: '~/.claude/settings.json'
    },
    { label: 'Edit settings manually', value: 'manual' },
    { label: 'Skip', value: 'skip' }
  ]

  const choice = await p.select({
    message: 'Configure settings for this account?',
    options
  })

  if (p.isCancel(choice)) {
    p.cancel('Operation cancelled')
    process.exit(0)
  }

  if (choice !== 'skip') {
    if (choice === 'common' && commonSettings) {
      await saveAccountSettings(accountDir, commonSettings)
      p.log.success('Common settings applied.')
    } else if (choice === 'global') {
      await syncFromGlobal(accountDir)
    } else if (choice === 'manual') {
      await editManually(accountDir)
    }
  }

  await promptSyncSkills(accountDir)
}

async function promptSyncSkills(accountDir: string): Promise<void> {
  const hasSkills = await globalSkillsExist()
  if (!hasSkills) {
    return
  }

  const method = await p.select({
    message: 'Sync skills directory from ~/.claude/skills?',
    options: [
      { label: 'Symlink', value: 'symlink', hint: 'recommended, shares the same directory' },
      { label: 'Copy', value: 'copy', hint: 'independent copy' },
      { label: 'Skip', value: 'skip' }
    ]
  })

  if (p.isCancel(method)) {
    p.cancel('Operation cancelled')
    process.exit(0)
  }

  if (method === 'symlink') {
    await symlinkSkills(accountDir)
    p.log.success('Skills directory symlinked.')
  } else if (method === 'copy') {
    await copySkills(accountDir)
    p.log.success('Skills directory copied.')
  }
}
