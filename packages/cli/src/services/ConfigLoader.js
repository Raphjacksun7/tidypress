import { findConfigFile, loadUserConfig, resolveDocsDir } from '../utils/config.js'
import fs from 'node:fs/promises'
import path from 'node:path'
import { withDefaults } from '@docsmint/config'

/**
 * Loads DocsMint project configuration and docs-directory context.
 */
export class ConfigLoader {
  /**
   * @param {{ projectRoot: string }} options
   * @returns {Promise<string>}
   */
  async resolveDocsDirectory({ projectRoot }) {
    return resolveDocsDir(projectRoot)
  }

  /**
   * @param {{ docsDir: string }} options
   * @returns {Promise<string>}
   */
  async ensureConfigFile({ docsDir }) {
    return findConfigFile(docsDir)
  }

  /**
   * @param {{ docsDir: string }} options
   * @returns {Promise<unknown>}
   */
  async loadConfig({ docsDir }) {
    return loadUserConfig(docsDir)
  }

  /**
   * @param {{ docsDir: string, io?: { info: (message: string) => void } }} options
   * @returns {Promise<void>}
   */
  async validateNavigation({ docsDir, io = console }) {
    const rawConfig = await this.loadConfig({ docsDir })
    const config = withDefaults(rawConfig)
    const nav = config.nav ?? []
    if (nav.length === 0) {
      return
    }

    const knownRoutes = await this.#collectKnownRoutes(docsDir, config.extensions?.customPages ?? [])
    const unknownInternal = nav
      .filter(item => !item.external && item.href.startsWith('/'))
      .map(item => item.href)
      .filter(href => !knownRoutes.has(href))

    if (unknownInternal.length === 0) {
      return
    }

    const mode = config.navPolicy?.mode ?? 'strict'
    const message = `Unknown internal nav routes: ${unknownInternal.join(', ')}`
    if (mode === 'strict') {
      throw new Error(message)
    }
    io.info(`[docsmint] ${message}`)
  }

  async #collectKnownRoutes(docsDir, customPages) {
    const routes = new Set(['/', '/docs', '/writing'])

    for (const page of customPages) {
      routes.add(`/${page.slug}`)
    }

    const docsFiles = await this.#walkMarkdown(path.resolve(docsDir, 'src/content/docs'))
    for (const filePath of docsFiles) {
      const id = path.relative(path.resolve(docsDir, 'src/content/docs'), filePath).replace(/\.(md|mdx)$/i, '')
      if (!id) continue
      routes.add(`/docs/${id.replaceAll(path.sep, '/')}`)
    }

    const writingFiles = await this.#walkMarkdown(path.resolve(docsDir, 'src/content/writing'))
    for (const filePath of writingFiles) {
      const id = path
        .relative(path.resolve(docsDir, 'src/content/writing'), filePath)
        .replace(/\.(md|mdx)$/i, '')
      if (!id) continue
      routes.add(`/writing/${id.replaceAll(path.sep, '/')}`)
    }

    return routes
  }

  async #walkMarkdown(rootDir) {
    /** @type {string[]} */
    const files = []
    try {
      const entries = await fs.readdir(rootDir, { withFileTypes: true })
      for (const entry of entries) {
        const entryPath = path.join(rootDir, entry.name)
        if (entry.isDirectory()) {
          files.push(...(await this.#walkMarkdown(entryPath)))
        } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {
          files.push(entryPath)
        }
      }
    } catch {
      // Directory missing is acceptable.
    }
    return files
  }
}
