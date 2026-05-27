import fs from 'node:fs/promises'
import path from 'node:path'
import {
  collectPluginManifest,
  collectPluginPathsToMount,
  formatPluginManifestModule,
  withDefaults,
} from '@tidypress/config'

/**
 * Regenerate plugin manifest and reload when config or plugin sources change in dev.
 * @returns {import('vite').Plugin}
 */
export function tidypressPluginDev() {
  /** @type {Promise<void>} */
  let regenQueue = Promise.resolve()

  return {
    name: 'tidypress:plugin-dev',
    apply: 'serve',
    configureServer(server) {
      const projectRoot = process.env.TIDYPRESS_PROJECT_ROOT
      if (!projectRoot) {
        return
      }

      const cacheDir =
        process.env.TIDYPRESS_CACHE_DIR ?? path.join(projectRoot, '.tidypress')
      const configPath = path.join(projectRoot, 'tidypress.config.ts')
      const manifestPath =
        process.env.TIDYPRESS_MANIFEST_PATH ??
        path.join(cacheDir, 'codegen', 'tidypress-plugins.mjs')
      /** @type {Set<string>} */
      const watchedRoots = new Set()

      const syncWatchRoots = async manifest => {
        const nextRoots = collectPluginPathsToMount(manifest)
        for (const root of watchedRoots) {
          if (!nextRoots.has(root)) {
            server.watcher.unwatch(path.join(projectRoot, root))
            watchedRoots.delete(root)
          }
        }
        for (const root of nextRoots) {
          if (watchedRoots.has(root)) {
            continue
          }
          const absolute = path.join(projectRoot, root)
          try {
            await fs.lstat(absolute)
            server.watcher.add(absolute)
            watchedRoots.add(root)
          } catch {
            // Optional plugin folder not created yet.
          }
        }
      }

      const regenerate = reason => {
        regenQueue = regenQueue
          .then(async () => {
            const { createJiti } = await import('jiti')
            const jiti = createJiti(import.meta.url, { interopDefault: true })
            const raw = await jiti.import(configPath)
            const config = raw?.default ?? raw
            const site = withDefaults(config)
            const manifest = collectPluginManifest(site, { projectRoot })
            await fs.mkdir(path.dirname(manifestPath), { recursive: true })
            await fs.writeFile(manifestPath, formatPluginManifestModule(manifest), 'utf8')
            await syncWatchRoots(manifest)

            globalThis.__TIDYPRESS_MANIFEST_EPOCH = (globalThis.__TIDYPRESS_MANIFEST_EPOCH ?? 0) + 1

            const moduleNode = server.moduleGraph.getModuleById(manifestPath)
            if (moduleNode) {
              server.moduleGraph.invalidateModule(moduleNode)
            }
            server.ws.send({ type: 'full-reload', path: '*' })
            server.config.logger.info(`[tidypress] plugin manifest updated (${reason})`)
          })
          .catch(error => {
            const message = error instanceof Error ? error.message : String(error)
            server.config.logger.error(`[tidypress] plugin manifest failed: ${message}`)
          })
        return regenQueue
      }

      server.watcher.add(configPath)
      regenerate('startup')

      server.watcher.on('change', changedPath => {
        const normalized = path.normalize(changedPath)
        if (normalized === path.normalize(configPath)) {
          regenerate('config')
          return
        }
        for (const root of watchedRoots) {
          const rootPath = path.join(projectRoot, root)
          if (normalized === rootPath || normalized.startsWith(`${rootPath}${path.sep}`)) {
            if (normalized.endsWith('.ts') || normalized.endsWith('.astro') || normalized.endsWith('.js')) {
              regenerate('plugin-source')
            }
            return
          }
        }
      })
    },
  }
}
