import fs from 'node:fs/promises'

/**
 * Cleans generated .docsmint working directory.
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
   * @returns {Promise<{ workdir: string }>}
   */
  async clean({ projectRoot }) {
    const docsDir = await this.configLoader.resolveDocsDirectory({ projectRoot })
    const workdir = this.engineManager.getWorkdir({ docsDir })
    await fs.rm(workdir, { recursive: true, force: true })
    return { workdir }
  }
}
