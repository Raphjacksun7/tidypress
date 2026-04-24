import fs from 'node:fs/promises'
import path from 'node:path'
import jitiFactory from 'jiti'

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
    path.resolve(docsDir, 'docsmint.config.ts'),
    path.resolve(docsDir, 'docsmint.config.js'),
  ]
  for (const candidate of candidates) {
    try {
      await fs.access(candidate)
      return candidate
    } catch {
      // Keep checking remaining candidates.
    }
  }
  throw new Error('Missing docs/docsmint.config.ts (or .js). Run `docsmint init` first.')
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
  const config = await jiti.import(configPath)
  return config?.default ?? config
}
