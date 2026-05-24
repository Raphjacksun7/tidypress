import fs from 'node:fs/promises'
import path from 'node:path'

import { getBuildDir, getCacheDir } from '../infrastructure/engine/build-session.js'

/**
 * Removes generated build output and docsmint cache for a project.
 */
export class CleanService {
  /**
   * @param {{ configLoader: import('./ConfigLoader.js').ConfigLoader, engineManager: import('./EngineManager.js').EngineManager }} dependencies
   */
  constructor({ configLoader, engineManager }) {
    this.configLoader = configLoader
    this.engineManager = engineManager
  }

  /**
   * @param {{ projectRoot: string }} request
   * @returns {Promise<{ buildDir: string, cacheDir: string }>}
   */
  async clean({ projectRoot }) {
    const docsDir = await this.configLoader.resolveDocsDirectory({ projectRoot })
    const buildDir = getBuildDir(docsDir)
    const cacheDir = await getCacheDir(docsDir)
    const legacyWorkdir = path.join(docsDir, '.docsmint')

    await fs.rm(buildDir, { recursive: true, force: true })
    await fs.rm(cacheDir, { recursive: true, force: true })
    await fs.rm(legacyWorkdir, { recursive: true, force: true })

    return { buildDir, cacheDir }
  }
}
