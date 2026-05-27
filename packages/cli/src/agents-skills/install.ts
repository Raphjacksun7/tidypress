import { cp, mkdir, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { detectAgents } from './agents.js'
import { readSkillsInstallMetadata, writeSkillsInstallMetadata } from './metadata.js'
import { confirm, isCiEnvironment, isInteractiveTerminal } from './prompt.js'

/** Skill directory names shipped with the CLI package. */
export const BUNDLED_SKILL_NAMES = ['tidypress', 'tidypress-contributor']

const SKILLS_INSTALL_HINT =
  'Retry with `tidypress skills install --force` or copy manually from https://github.com/Raphjacksun7/tidypress/tree/main/skills'

/**
 * Absolute path to skills bundled in the published CLI package.
 */
export function resolveBundledSkillsRoot() {
  return path.resolve(fileURLToPath(new URL('../../skills', import.meta.url)))
}

/**
 * @param {string} sourceDir
 * @param {string} targetDir
 */
async function copySkillDirectory(sourceDir, targetDir) {
  await mkdir(path.dirname(targetDir), { recursive: true })
  await cp(sourceDir, targetDir, { recursive: true, force: true })
}

/**
 * @param {string} skillsRoot
 * @returns {Promise<string[]>}
 */
async function listBundledSkillNames(skillsRoot) {
  const entries = await readdir(skillsRoot, { withFileTypes: true })
  const names = []
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) {
      continue
    }
    const skillFile = path.join(skillsRoot, entry.name, 'SKILL.md')
    try {
      const fileStat = await stat(skillFile)
      if (fileStat.isFile()) {
        names.push(entry.name)
      }
    } catch {
      // Not a skill directory.
    }
  }
  return names.sort()
}

/**
 * @param {{
 *   force?: boolean
 *   io?: { info: (message: string) => void, warn?: (message: string) => void }
 * }} [options]
 */
export async function maybeInstallTidyPressSkillsGlobally({ force = false, io = console } = {}) {
  const warn = io.warn ?? io.info.bind(io)

  if (isCiEnvironment() && !force) {
    return { status: 'skipped', reason: 'ci' }
  }

  const existing = await readSkillsInstallMetadata()
  if (existing !== undefined && !force) {
    return { status: 'skipped', reason: 'already_prompted' }
  }

  const detectedAgents = await detectAgents()
  if (detectedAgents.length === 0) {
    return { status: 'skipped', reason: 'no_agents' }
  }

  if (!force && !isInteractiveTerminal()) {
    io.info(
      `TidyPress agent skills are available for: ${detectedAgents.map((a) => a.name).join(', ')}. Run \`tidypress skills install\` in an interactive terminal, or use \`--install-skills\`.`,
    )
    return { status: 'skipped', reason: 'non_interactive' }
  }

  const accepted =
    force ||
    (await confirm(
      `TidyPress detected the following AI coding agents: ${detectedAgents.map((a) => a.name).join(', ')}. Would you like to install TidyPress skills for them?`,
      { defaultValue: true },
    ))

  if (!accepted) {
    await writeSkillsInstallMetadata({
      version: 1,
      accepted: false,
      date: new Date().toISOString(),
      detectedAgentIds: detectedAgents.map((a) => a.id),
    })
    return { status: 'skipped', reason: 'declined' }
  }

  const skillsRoot = resolveBundledSkillsRoot()
  const skillNames = await listBundledSkillNames(skillsRoot)
  if (skillNames.length === 0) {
    warn(`No bundled TidyPress skills found at ${skillsRoot}.`)
    warn(SKILLS_INSTALL_HINT)
    return { status: 'failed', reason: 'missing_bundle' }
  }

  /** @type {string[]} */
  const failedAgents = []
  /** @type {string[]} */
  const succeededAgents = []

  for (const agent of detectedAgents) {
    try {
      await mkdir(agent.globalSkillsPath, { recursive: true })
      for (const skillName of skillNames) {
        const sourceDir = path.join(skillsRoot, skillName)
        const targetDir = path.join(agent.globalSkillsPath, skillName)
        await copySkillDirectory(sourceDir, targetDir)
      }
      succeededAgents.push(agent.name)
    } catch (error) {
      failedAgents.push(agent.name)
      warn(
        `Skills installation failed for ${agent.name}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  if (succeededAgents.length > 0) {
    io.info(`Successfully installed TidyPress skills for: ${succeededAgents.join(', ')}.`)
  }

  if (failedAgents.length > 0) {
    warn(SKILLS_INSTALL_HINT)
  }

  await writeSkillsInstallMetadata({
    version: 1,
    accepted: true,
    date: new Date().toISOString(),
    detectedAgentIds: detectedAgents.map((a) => a.id),
    installFailed: failedAgents.length > 0,
  })

  return {
    status: failedAgents.length === detectedAgents.length ? 'failed' : 'installed',
    succeededAgents,
    failedAgents,
    skillNames,
  }
}
