import { TidyPressError } from '../errors/TidyPressError.js'

/**
 * Handles `tidypress ai` (stretch scaffold).
 */
export class AiCommand {
  /**
   * @param {{ experimentalFeatureService: import('../services/ExperimentalFeatureService.js').ExperimentalFeatureService }} dependencies
   */
  constructor({ experimentalFeatureService }) {
    this.experimentalFeatureService = experimentalFeatureService
  }

  /**
   * @param {{
   *   projectRoot: string
   *   enableExperimentalAi: boolean
   *   action: 'suggest' | 'translate' | 'changelog'
   *   args: string[]
   * }} request
   * @returns {Promise<void>}
   */
  async execute({ projectRoot, enableExperimentalAi, action }) {
    await this.experimentalFeatureService.assertEnabled({
      projectRoot,
      feature: 'ai',
      cliEnabled: enableExperimentalAi,
      cliHint: 'Use tidypress ai <suggest|translate|changelog> [args] --enable-experimental-ai',
      configHint: 'Set experimental.ai = true in docs/tidypress.config.ts',
    })

    throw new TidyPressError(
      `Experimental AI action (${action}) scaffold is ready, but implementation is not available yet.`,
      'EXPERIMENTAL_NOT_IMPLEMENTED',
      'Task 19 keeps stretch work guarded until prerequisites are production-ready.',
      { exitCode: 2 },
    )
  }
}
