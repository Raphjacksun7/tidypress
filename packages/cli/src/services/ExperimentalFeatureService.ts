import { isCapabilityEnabled, withDefaults } from '@tidypress/config'
import { TidyPressError } from '../errors/TidyPressError.js'

/**
 * Explicit guardrail for risky stretch features.
 * A feature executes only when both CLI and config opt-ins are true.
 */
export class ExperimentalFeatureService {
  configLoader: any


  /**
   * @param {{ configLoader: import('./ConfigLoader.js').ConfigLoader }} dependencies
   */
  constructor({ configLoader }) {
    this.configLoader = configLoader
  }

  /**
   * @param {{
   *   projectRoot: string
   *   feature: 'editor' | 'export' | 'ai'
   *   cliEnabled: boolean
   *   cliHint: string
   *   configHint: string
   * }} request
   * @returns {Promise<void>}
   */
  async assertEnabled({ projectRoot, feature, cliEnabled, cliHint, configHint }) {
    if (!cliEnabled) {
      throw new TidyPressError(
        `Experimental ${feature} is disabled. Pass the explicit CLI flag to continue.`,
        'EXPERIMENTAL_FLAG_REQUIRED',
        cliHint,
        { exitCode: 2 },
      )
    }

    const docsDir = await this.configLoader.resolveDocsDirectory({ projectRoot })
    await this.configLoader.ensureConfigFile({ docsDir })
    const rawConfig = await this.configLoader.loadConfig({ docsDir })
    const config = withDefaults(rawConfig)
    const enabled = isCapabilityEnabled(config, feature)
    if (!enabled) {
      throw new TidyPressError(
        `Experimental ${feature} is disabled in docs config.`,
        'EXPERIMENTAL_CONFIG_DISABLED',
        configHint,
        { exitCode: 2 },
      )
    }
  }
}
