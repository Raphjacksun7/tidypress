import fs from 'node:fs/promises'
import path from 'node:path'

import { collectSiteUrlWarnings, isCapabilityEnabled, withDefaults } from '@tidypress/config'
import { writeLlmsTxt } from '../application/content/llms-txt.js'
import { getCacheDir } from '../infrastructure/engine/build-session.js'

/**
 * BuildService orchestrates config checks and static-site build steps.
 */
export class BuildService {
  configLoader: any
  engineManager: any
  io: { info: (message: string) => void } | undefined


  /**
   * @param {{ configLoader: import('./ConfigLoader.js').ConfigLoader, engineManager: import('./EngineManager.js').EngineManager, io?: { info: (message: string) => void } }} dependencies
   */
  constructor({ configLoader, engineManager, io }) {
    this.configLoader = configLoader
    this.engineManager = engineManager
    this.io = io
  }

  /**
   * @param {{ projectRoot: string, outputPath?: string, skipLlmsTxt?: boolean }} request
   * @returns {Promise<{ docsDir: string, buildDir: string, cacheDir: string }>}
   */
  async build({ projectRoot, outputPath, skipLlmsTxt = false }) {
    const docsDir = await this.configLoader.resolveDocsDirectory({ projectRoot })
    await this.configLoader.ensureConfigFile({ docsDir })
    await this.configLoader.validateNavigation({ docsDir })
    const rawConfig = await this.configLoader.loadConfig({ docsDir })
    for (const warning of collectSiteUrlWarnings(rawConfig)) {
      this.io?.info(`[tidypress] ${warning}`)
    }
    const config = withDefaults(rawConfig)
    const session = await this.engineManager.prepare({ docsDir, mode: 'build' })
    await this.engineManager.runBuild({ session })

    const buildDir = this.engineManager.getBuildDirectory({ docsDir })
    const writeLlmsTxtFile =
      !skipLlmsTxt && isCapabilityEnabled(config, 'llmsTxt')
    if (writeLlmsTxtFile) {
      await writeLlmsTxt({
        docsDir,
        outputPath: path.join(buildDir, 'llms.txt'),
        config,
      })
    }
    await this.#exportConfigSidecar({ docsDir, cacheDir: session.cacheDir, config })

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
  async #exportConfigSidecar({ docsDir, cacheDir, config }) {
    await fs.mkdir(cacheDir, { recursive: true })
    await fs.writeFile(
      path.join(cacheDir, 'config.json'),
      `${JSON.stringify(config, (_key, value) => (value instanceof Date ? value.toISOString() : value), 2)}\n`,
      'utf8',
    )
  }
}
