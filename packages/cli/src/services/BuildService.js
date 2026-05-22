import fs from 'node:fs/promises'
import path from 'node:path'

import { withDefaults } from '@docsmint/config'

/**
 * BuildService orchestrates config checks and static-site build steps.
 */
export class BuildService {
  /**
   * @param {{ configLoader: import('./ConfigLoader.js').ConfigLoader, engineManager: import('./EngineManager.js').EngineManager }} dependencies
   */
  constructor({ configLoader, engineManager }) {
    this.configLoader = configLoader
    this.engineManager = engineManager
  }

  /**
   * @param {{ projectRoot: string }} request
   * @returns {Promise<{ docsDir: string, workdir: string, distDir: string }>}
   */
  async build({ projectRoot, outputPath }) {
    const docsDir = await this.configLoader.resolveDocsDirectory({ projectRoot })
    await this.configLoader.ensureConfigFile({ docsDir })
    await this.configLoader.validateNavigation({ docsDir })
    const workdir = await this.engineManager.prepare({ docsDir, mode: 'build' })
    await this.engineManager.runBuild({ workdir })

    const distDir = this.engineManager.getDistDirectory({ docsDir })
    await this.#exportConfigSidecar({ docsDir, projectRoot })

    if (outputPath) {
      const { copyDistToDestination } = await import('../application/deployment/deploy-target.js')
      await copyDistToDestination({
        distDir,
        destinationDir: outputPath,
      })
    }

    return {
      docsDir,
      workdir,
      distDir,
    }
  }

  /**
   * @param {{ docsDir: string, projectRoot: string }} options
   */
  async #exportConfigSidecar({ docsDir, projectRoot }) {
    const raw = await this.configLoader.loadConfig({ docsDir })
    const config = withDefaults(raw)
    const sidecarDir = path.join(docsDir, '.docsmint')
    await fs.mkdir(sidecarDir, { recursive: true })
    await fs.writeFile(
      path.join(sidecarDir, 'config.json'),
      `${JSON.stringify(config, (_key, value) => (value instanceof Date ? value.toISOString() : value), 2)}\n`,
      'utf8',
    )
  }
}
