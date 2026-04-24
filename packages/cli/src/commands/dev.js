/**
 * Handles `docsmint dev`.
 */
export class DevCommand {
  /**
   * @param {{ configLoader: import('../services/ConfigLoader.js').ConfigLoader, engineManager: import('../services/EngineManager.js').EngineManager }} dependencies
   */
  constructor({ configLoader, engineManager }) {
    this.configLoader = configLoader
    this.engineManager = engineManager
  }

  /**
   * @param {{ projectRoot: string, port: number }} request
   * @returns {Promise<void>}
   */
  async execute({ projectRoot, port }) {
    const docsDir = await this.configLoader.resolveDocsDirectory({ projectRoot })
    await this.configLoader.ensureConfigFile({ docsDir })
    await this.configLoader.validateNavigation({ docsDir })
    const workdir = await this.engineManager.prepare({ docsDir, mode: 'dev' })
    await this.engineManager.runDev({ workdir, port })
  }
}
