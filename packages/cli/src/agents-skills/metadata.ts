import { mkdir, readFile, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

const METADATA_DIR = path.join(os.homedir(), '.tidypress')
const METADATA_FILE = path.join(METADATA_DIR, 'agents-skills-install.json')

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
    const raw = await readFile(METADATA_FILE, 'utf8')
    return /** @type {SkillsInstallMetadata} */ (JSON.parse(raw))
  } catch {
    return undefined
  }
}

/**
 * @param {SkillsInstallMetadata} metadata
 */
export async function writeSkillsInstallMetadata(metadata) {
  await mkdir(METADATA_DIR, { recursive: true })
  await writeFile(METADATA_FILE, `${JSON.stringify(metadata, null, 2)}\n`, 'utf8')
}
