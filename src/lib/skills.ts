import { cp, lstat, readdir, rm, symlink } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'

export function getGlobalSkillsDir(): string {
  return join(homedir(), '.claude', 'skills')
}

export function getAccountSkillsDir(accountDir: string): string {
  return join(accountDir, 'skills')
}

export async function globalSkillsExist(): Promise<boolean> {
  try {
    const entries = await readdir(getGlobalSkillsDir())
    return entries.length > 0
  } catch {
    return false
  }
}

async function removeExisting(path: string): Promise<void> {
  try {
    const info = await lstat(path)
    if (info.isSymbolicLink() || info.isDirectory()) {
      await rm(path, { recursive: true, force: true })
    }
  } catch {
    // does not exist, nothing to remove
  }
}

export async function symlinkSkills(accountDir: string): Promise<void> {
  const target = getAccountSkillsDir(accountDir)
  await removeExisting(target)
  await symlink(getGlobalSkillsDir(), target)
}

export async function copySkills(accountDir: string): Promise<void> {
  const target = getAccountSkillsDir(accountDir)
  await removeExisting(target)
  await cp(getGlobalSkillsDir(), target, { recursive: true })
}
