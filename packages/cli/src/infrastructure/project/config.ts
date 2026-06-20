import fs from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'
import jitiFactory from 'jiti'

import { TidyPressError } from '../../errors/TidyPressError.js'

/** Default publish root folder created by `tidypress init`. */
export const DEFAULT_PUBLISH_ROOT_DIR = 'site'

const CONFIG_FILENAMES = ['tidypress.config.ts', 'tidypress.config.js']

const SKIP_SCAN_DIRS = new Set([
  'node_modules',
  '.git',
  'build',
  'dist',
  '.cache',
  '.turbo',
  '.next',
  'coverage',
])

/**
 * @param {string} publishRoot
 * @returns {Promise<boolean>}
 */
export async function configExistsAt(publishRoot) {
  for (const name of CONFIG_FILENAMES) {
    try {
      await fs.access(path.resolve(publishRoot, name))
      return true
    } catch {
      // Keep checking remaining candidates.
    }
  }
  return false
}

/**
 * @param {string} projectRoot
 * @returns {string}
 */
export function getSiteDir(projectRoot) {
  return path.resolve(projectRoot, DEFAULT_PUBLISH_ROOT_DIR)
}

/**
 * @param {string} projectRoot
 * @returns {string}
 * @deprecated Use {@link getSiteDir}. Kept for internal call sites during rename.
 */
export function getDocsDir(projectRoot) {
  return getSiteDir(projectRoot)
}

/**
 * @param {string} publishRoot
 * @returns {Promise<string>}
 */
export async function findConfigFile(publishRoot) {
  for (const name of CONFIG_FILENAMES) {
    const candidate = path.resolve(publishRoot, name)
    try {
      await fs.access(candidate)
      return candidate
    } catch {
      // Keep checking remaining candidates.
    }
  }
  throw new TidyPressError(
    `Missing tidypress.config.ts (or .js) in publish root: ${publishRoot}`,
    'CONFIG_NOT_FOUND',
    'Run `tidypress init`, cd into your publish root, or set TIDYPRESS_PUBLISH_ROOT.',
  )
}

/**
 * @param {string} projectRoot
 * @returns {Promise<string[]>}
 */
async function discoverChildPublishRoots(projectRoot) {
  /** @type {string[]} */
  const matches = []
  let entries
  try {
    entries = await fs.readdir(projectRoot, { withFileTypes: true })
  } catch {
    return matches
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    if (entry.name.startsWith('.') || SKIP_SCAN_DIRS.has(entry.name)) continue
    const candidate = path.join(projectRoot, entry.name)
    if (await configExistsAt(candidate)) {
      matches.push(candidate)
    }
  }

  return matches.sort()
}

/**
 * Resolve the publish root from the working directory.
 *
 * Order: `TIDYPRESS_PUBLISH_ROOT`, config at cwd, `site/`, then any direct
 * child directory that contains `tidypress.config.*`. Falls back to `site/` for init.
 *
 * @param {string} projectRoot
 * @returns {Promise<string>}
 */
export async function resolvePublishRoot(projectRoot) {
  const root = path.resolve(projectRoot)

  const envOverride = process.env.TIDYPRESS_PUBLISH_ROOT?.trim()
  if (envOverride) {
    const fromEnv = path.isAbsolute(envOverride) ? envOverride : path.resolve(root, envOverride)
    if (await configExistsAt(fromEnv)) {
      return fromEnv
    }
    throw new TidyPressError(
      `TIDYPRESS_PUBLISH_ROOT does not contain tidypress.config.ts (or .js): ${fromEnv}`,
      'CONFIG_NOT_FOUND',
      'Point TIDYPRESS_PUBLISH_ROOT at the folder with your config, or unset it.',
    )
  }

  const fixedCandidates = [root, path.resolve(root, DEFAULT_PUBLISH_ROOT_DIR)]
  for (const candidate of fixedCandidates) {
    if (await configExistsAt(candidate)) {
      return candidate
    }
  }

  const discovered = await discoverChildPublishRoots(root)
  if (discovered.length === 1) {
    return discovered[0]
  }
  if (discovered.length > 1) {
    throw new TidyPressError(
      `Multiple publish roots found under ${root}: ${discovered.map(dir => path.basename(dir)).join(', ')}`,
      'CONFIG_AMBIGUOUS',
      'cd into one publish root, or set TIDYPRESS_PUBLISH_ROOT.',
    )
  }

  return path.resolve(root, DEFAULT_PUBLISH_ROOT_DIR)
}

/**
 * @param {string} projectRoot
 * @returns {Promise<string>}
 * @deprecated Use {@link resolvePublishRoot}.
 */
export async function resolveDocsDir(projectRoot) {
  return resolvePublishRoot(projectRoot)
}

/**
 * @param {string} publishRoot
 */
export async function loadUserConfig(publishRoot) {
  const configPath = await findConfigFile(publishRoot)
  const require = createRequire(import.meta.url)
  const alias: Record<string, string> = {}
  try {
    alias.tidypress = require.resolve('tidypress')
  } catch {
    // Keep default resolution.
  }
  try {
    alias['tidypress/config'] = require.resolve('tidypress/config')
  } catch {
    // Keep default resolution.
  }
  const jiti = jitiFactory(import.meta.url, {
    interopDefault: true,
    alias: Object.keys(alias).length > 0 ? alias : undefined,
  })
  const loaded = await jiti.import(configPath)
  const config = /** @type {{ default?: unknown } | unknown} */ (loaded)
  if (config && typeof config === 'object' && 'default' in config) {
    return /** @type {import('@tidypress/config').TidyPressConfig} */ (config.default)
  }
  return /** @type {import('@tidypress/config').TidyPressConfig} */ (config)
}
