import { mkdir, readFile, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

function metadataPaths() {
  const dir = path.join(os.homedir(), '.tidypress')
  return { dir, file: path.join(dir, 'agents-skills-install.json') }
}

/**
 * @typedef {{
 *   version: 1
 *   accepted: boolean
 *   date: string
 *   detectedAgentIds?: string[]
 *   installFailed?: boolean
 * }} SkillsInstallMetadata
 */

/**
 * @returns {Promise<SkillsInstallMetadata | undefined>}
 */
export async function readSkillsInstallMetadata() {
  try {
    const { file } = metadataPaths()
    const raw = await readFile(file, 'utf8')
    return /** @type {SkillsInstallMetadata} */ (JSON.parse(raw))
  } catch {
    return undefined
  }
}

/**
 * @param {SkillsInstallMetadata} metadata
 */
export async function writeSkillsInstallMetadata(metadata) {
  const { dir, file } = metadataPaths()
  await mkdir(dir, { recursive: true })
  await writeFile(file, `${JSON.stringify(metadata, null, 2)}\n`, 'utf8')
}
