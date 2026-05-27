import fs from 'node:fs/promises'
import path from 'node:path'
import jitiFactory from 'jiti'
import {
  collectPluginManifest,
  collectPluginPathsToMount,
  formatPluginManifestModule,
  withDefaults,
} from '@tidypress/config'

import { TidyPressError } from '../../errors/TidyPressError.js'

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
      throw new TidyPressError(
        `Failed to load presentation module for "${scope}" at ${modulePath}: ${message}`,
        'PLUGIN_PRESENTATION_LOAD_FAILED',
        'Export createPresentation(site, context) or a default factory from that file.',
      )
    }
    const moduleExports = /** @type {{ createPresentation?: unknown, default?: unknown }} */ (loaded)
    const factory = moduleExports.createPresentation ?? moduleExports.default
    if (typeof factory !== 'function') {
      throw new TidyPressError(
        `Presentation module "${modulePath}" (${scope}) must export createPresentation(site, context) or a default factory function.`,
        'PLUGIN_PRESENTATION_INVALID',
        'See Rendering extensibility in the docs.',
      )
    }
  }
}

export { collectPluginManifest }

/**
 * @param {{ docsDir: string, config: import('@tidypress/config').TidyPressConfig, manifestPath: string }} options
 */
export async function writePluginManifest({ docsDir, config, manifestPath }) {
  const site = withDefaults(config)
  const manifest = collectPluginManifest(site, { projectRoot: docsDir })
  await fs.mkdir(path.dirname(manifestPath), { recursive: true })
  await fs.writeFile(manifestPath, formatPluginManifestModule(manifest), 'utf8')
  await validatePresentationModules(docsDir, manifest.presentationModules)

  return { manifest, pathsToMount: collectPluginPathsToMount(manifest) }
}

/**
 * Symlink optional project extension trees into the cache for dev file watching only.
 * Astro view imports resolve via the `@project` alias — no copy required for build.
 *
 * @param {string} docsDir
 * @param {Set<string>} pathsToMount
 * @param {string} cacheDir
 * @param {'dev' | 'build' | 'preview'} mode
 */
export async function mountProjectPaths(docsDir, pathsToMount, cacheDir, mode) {
  if (mode !== 'dev') {
    return
  }
  const mountsRoot = path.join(cacheDir, 'mounts')
  await fs.mkdir(mountsRoot, { recursive: true })
  for (const topLevel of pathsToMount) {
    const sourcePath = path.resolve(docsDir, topLevel)
    const targetPath = path.join(mountsRoot, topLevel)
    try {
      await fs.lstat(sourcePath)
    } catch {
      continue
    }
    await fs.rm(targetPath, { recursive: true, force: true })
    await fs.mkdir(path.dirname(targetPath), { recursive: true })
    await fs.symlink(sourcePath, targetPath, 'junction')
  }
}
