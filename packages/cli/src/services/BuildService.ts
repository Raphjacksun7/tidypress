import fs from 'node:fs/promises'
import path from 'node:path'

import { withDefaults } from '@tidypress/config'
import { getCacheDir } from '../infrastructure/engine/build-session.js'

/**
 * BuildService orchestrates config checks and static-site build steps.
 */
export class BuildService {
  configLoader: any
  engineManager: any


  /**
   * @param {{ configLoader: import('./ConfigLoader.js').ConfigLoader, engineManager: import('./EngineManager.js').EngineManager }} dependencies
   */
  constructor({ configLoader, engineManager }) {
    this.configLoader = configLoader
    this.engineManager = engineManager
  }

  /**
   * @param {{ projectRoot: string, outputPath?: string }} request
   * @returns {Promise<{ docsDir: string, buildDir: string, cacheDir: string }>}
   */
  async build({ projectRoot, outputPath }) {
    const docsDir = await this.configLoader.resolveDocsDirectory({ projectRoot })
    await this.configLoader.ensureConfigFile({ docsDir })
    await this.configLoader.validateNavigation({ docsDir })
    const session = await this.engineManager.prepare({ docsDir, mode: 'build' })
    await this.engineManager.runBuild({ session })

    const buildDir = this.engineManager.getBuildDirectory({ docsDir })
    await this.#exportConfigSidecar({ docsDir, cacheDir: session.cacheDir })

    if (outputPath) {
      const { copyDistToDestination } = await import('../application/deployment/deploy-target.js')
      await copyDistToDestination({
        distDir: buildDir,
        destinationDir: outputPath,
      })
    }

    return {
      docsDir,
      buildDir,
      cacheDir: session.cacheDir,
    }
  }

  /**
   * @param {{ docsDir: string, cacheDir: string }} options
   */
  async #exportConfigSidecar({ docsDir, cacheDir }) {
    const raw = await this.configLoader.loadConfig({ docsDir })
    const config = withDefaults(raw)
    await fs.mkdir(cacheDir, { recursive: true })
    await fs.writeFile(
      path.join(cacheDir, 'config.json'),
      `${JSON.stringify(config, (_key, value) => (value instanceof Date ? value.toISOString() : value), 2)}\n`,
      'utf8',
    )
  }
}
