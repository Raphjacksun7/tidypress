import fs from 'node:fs/promises'
import path from 'node:path'
import jitiFactory from 'jiti'

import { TidyPressError } from '../../errors/TidyPressError.js'

/**
 * @param {string} projectRoot
 * @returns {string}
 */
export function getDocsDir(projectRoot) {
  return path.resolve(projectRoot, 'docs')
}

/**
 * @param {string} docsDir
 * @returns {Promise<string>}
 */
export async function findConfigFile(docsDir) {
  const candidates = [
    path.resolve(docsDir, 'tidypress.config.ts'),
    path.resolve(docsDir, 'tidypress.config.js'),
  ]
  for (const candidate of candidates) {
    try {
      await fs.access(candidate)
      return candidate
    } catch {
      // Keep checking remaining candidates.
    }
  }
  throw new TidyPressError(
    'Missing docs/tidypress.config.ts (or .js).',
    'CONFIG_NOT_FOUND',
    'Run `tidypress init` first.',
  )
}

/**
 * @param {string} projectRoot
 */
export async function resolveDocsDir(projectRoot) {
  const candidates = [
    path.resolve(projectRoot, 'docs'),
    projectRoot,
  ]

  for (const candidate of candidates) {
    try {
      await findConfigFile(candidate)
      return candidate
    } catch {
      // Continue searching.
    }
  }

  return path.resolve(projectRoot, 'docs')
}

/**
 * @param {string} docsDir
 */
export async function loadUserConfig(docsDir) {
  const configPath = await findConfigFile(docsDir)
  const jiti = jitiFactory(import.meta.url, { interopDefault: true })
  const loaded = await jiti.import(configPath)
  const config = /** @type {{ default?: unknown } | unknown} */ (loaded)
  if (config && typeof config === 'object' && 'default' in config) {
    return /** @type {import('@tidypress/config').TidyPressConfig} */ (config.default)
  }
  return /** @type {import('@tidypress/config').TidyPressConfig} */ (config)
}
