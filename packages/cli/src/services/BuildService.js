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
  async build({ projectRoot }) {
    const docsDir = await this.configLoader.resolveDocsDirectory({ projectRoot })
    await this.configLoader.ensureConfigFile({ docsDir })
    await this.configLoader.validateNavigation({ docsDir })
    const workdir = await this.engineManager.prepare({ docsDir, mode: 'build' })
    await this.engineManager.runBuild({ workdir })

    return {
      docsDir,
      workdir,
      distDir: this.engineManager.getDistDirectory({ docsDir }),
    }
  }
}
