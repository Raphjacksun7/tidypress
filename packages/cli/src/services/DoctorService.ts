import { collectSiteUrlWarnings } from '@tidypress/config'

/**
 * Doctor checks basic runtime and config prerequisites.
 */
export class DoctorService {
  configLoader: any


  /**
   * @param {{ configLoader: import('./ConfigLoader.js').ConfigLoader }} dependencies
   */
  constructor({ configLoader }) {
    this.configLoader = configLoader
  }

  /**
   * @param {{ projectRoot: string }} request
   * @returns {Promise<{ docsDir: string, warnings: string[] }>}
   */
  async run({ projectRoot }) {
    const docsDir = await this.configLoader.resolveDocsDirectory({ projectRoot })
    await this.configLoader.ensureConfigFile({ docsDir })
    const rawConfig = await this.configLoader.loadConfig({ docsDir })
    return {
      docsDir,
      warnings: collectSiteUrlWarnings(rawConfig),
    }
  }
}
