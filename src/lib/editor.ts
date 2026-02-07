import { spawn } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export async function openEditor(content: string, extension = '.json'): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'ccss-'))
  const file = join(dir, `edit${extension}`)
  await writeFile(file, content, 'utf-8')
  const editor = process.env.VISUAL || process.env.EDITOR || 'vi'
  await new Promise<void>((resolve, reject) => {
    const child = spawn(editor, [file], { stdio: 'inherit' })
    child.on('close', (code) =>
      code === 0 ? resolve() : reject(new Error(`Editor exited with code ${code}`))
    )
    child.on('error', reject)
  })
  const result = await readFile(file, 'utf-8')
  await rm(dir, { recursive: true, force: true })
  return result
}
