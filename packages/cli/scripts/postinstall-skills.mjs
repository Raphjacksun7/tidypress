/**
 * Runs after `npm install` / `pnpm add tidypress` in an interactive environment.
 * Never fails the install — skills are optional.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const distInstall = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../dist/agents-skills/install.js',
)

function shouldSkip() {
  if (process.env.TIDYPRESS_SKIP_SKILLS_INSTALL === '1') {
    return true
  }
  if (process.env.npm_config_ignore_scripts === 'true') {
    return true
  }
  return false
}

if (!shouldSkip() && fs.existsSync(distInstall)) {
  try {
    const { maybeInstallTidyPressSkillsGlobally } = await import('../dist/agents-skills/install.js')
    await maybeInstallTidyPressSkillsGlobally({ force: false, io: console })
  } catch {
    // Do not block package install.
  }
}
