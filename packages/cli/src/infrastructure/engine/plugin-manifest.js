import fs from 'node:fs/promises'
import path from 'node:path'
import jitiFactory from 'jiti'
import {
  collectPluginManifest,
  collectPluginPathsToMount,
  formatPluginManifestModule,
  withDefaults,
} from '@docsmint/config'

import { DocsMintError } from '../../errors/DocsMintError.js'

/**
 * @param {string} docsDir
 * @param {Record<string, string>} presentationModules
 */
export async function validatePresentationModules(docsDir, presentationModules) {
  const jiti = jitiFactory(import.meta.url, { interopDefault: true })
  for (const [scope, modulePath] of Object.entries(presentationModules)) {
    const absolute = path.resolve(docsDir, modulePath.replace(/^\.\//, ''))
    let loaded
    try {
      loaded = await jiti.import(absolute)
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause)
      throw new DocsMintError(
        `Failed to load presentation module for "${scope}" at ${modulePath}: ${message}`,
        'PLUGIN_PRESENTATION_LOAD_FAILED',
        'Export createPresentation(site, context) or a default factory from that file.',
      )
    }
    const factory = loaded?.createPresentation ?? loaded?.default
    if (typeof factory !== 'function') {
      throw new DocsMintError(
        `Presentation module "${modulePath}" (${scope}) must export createPresentation(site, context) or a default factory function.`,
        'PLUGIN_PRESENTATION_INVALID',
        'See Rendering extensibility in the docs.',
      )
    }
  }
}

export { collectPluginManifest }

/**
 * @param {string} docsDir
 * @param {import('@docsmint/config').DocsMintConfig} config
 * @param {string} workdir
 */
export async function writePluginManifest({ docsDir, config, workdir }) {
  const site = withDefaults(config)
  const manifest = collectPluginManifest(site, { projectRoot: docsDir })
  const generatedDir = path.resolve(workdir, 'src/generated')
  await fs.mkdir(generatedDir, { recursive: true })

  const outPath = path.resolve(generatedDir, 'docsmint-plugins.mjs')
  await fs.writeFile(outPath, formatPluginManifestModule(manifest), 'utf8')
  await validatePresentationModules(docsDir, manifest.presentationModules)

  return { manifest, pathsToMount: collectPluginPathsToMount(manifest) }
}

/**
 * @param {string} docsDir
 * @param {Set<string>} pathsToMount
 * @param {'dev' | 'build' | 'preview'} mode
 */
export async function mountProjectPaths(docsDir, pathsToMount, mode) {
  for (const topLevel of pathsToMount) {
    const sourcePath = path.resolve(docsDir, topLevel)
    const targetPath = path.resolve(docsDir, '.docsmint', topLevel)
    try {
      await fs.lstat(sourcePath)
    } catch {
      continue
    }
    await fs.rm(targetPath, { recursive: true, force: true })
    await fs.mkdir(path.dirname(targetPath), { recursive: true })
    if (mode === 'dev') {
      await fs.symlink(sourcePath, targetPath, 'junction')
    } else {
      await fs.cp(sourcePath, targetPath, { recursive: true })
    }
  }
}
