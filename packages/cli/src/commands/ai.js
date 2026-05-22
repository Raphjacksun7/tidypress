import { DocsMintError } from '../errors/DocsMintError.js'

/**
 * Handles `docsmint ai` (stretch scaffold).
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
      cliHint: 'Use docsmint ai <suggest|translate|changelog> [args] --enable-experimental-ai',
      configHint: 'Set experimental.ai = true in docs/docsmint.config.ts',
    })

    throw new DocsMintError(
      `Experimental AI action (${action}) scaffold is ready, but implementation is not available yet.`,
      'EXPERIMENTAL_NOT_IMPLEMENTED',
      'Task 19 keeps stretch work guarded until prerequisites are production-ready.',
      { exitCode: 2 },
    )
  }
}
