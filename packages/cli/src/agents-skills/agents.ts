import os from 'node:os'
import path from 'node:path'
import { access } from 'node:fs/promises'

/**
 * @typedef {{
 *   id: string
 *   name: string
 *   globalSkillsPath: string
 * }} DetectedAgent
 */

/** @type {Array<{ id: string, name: string, markerDirs: string[] }>} */
const KNOWN_AGENTS = [
  {
    id: 'cursor',
    name: 'Cursor',
    markerDirs: ['.cursor'],
  },
  {
    id: 'claude',
    name: 'Claude Code',
    markerDirs: ['.claude'],
  },
  {
    id: 'codex',
    name: 'Codex',
    markerDirs: ['.codex'],
  },
]

/**
 * @param {string} directory
 */
async function pathExists(directory) {
  try {
    await access(directory)
    return true
  } catch {
    return false
  }
}

/**
 * Detects installed AI coding agents by their config directories.
 *
 * @returns {Promise<DetectedAgent[]>}
 */
export async function detectAgents() {
  const home = os.homedir()
  /** @type {DetectedAgent[]} */
  const detected = []

  for (const agent of KNOWN_AGENTS) {
    const markers = await Promise.all(
      agent.markerDirs.map((dir) => pathExists(path.join(home, dir))),
    )
    if (!markers.some(Boolean)) {
      continue
    }

    detected.push({
      id: agent.id,
      name: agent.name,
      globalSkillsPath: path.join(home, agent.markerDirs[0], 'skills'),
    })
  }

  return detected
}
