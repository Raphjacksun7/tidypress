import { TidyPressError } from '../errors/TidyPressError.js'

/**
 * Handles `tidypress editor` (stretch scaffold).
 */
export class EditorCommand {
  experimentalFeatureService: any


  /**
   * @param {{ experimentalFeatureService: import('../services/ExperimentalFeatureService.js').ExperimentalFeatureService }} dependencies
   */
  constructor({ experimentalFeatureService }) {
    this.experimentalFeatureService = experimentalFeatureService
  }

  /**
   * @param {{ projectRoot: string, enableExperimentalEditor: boolean }} request
   * @returns {Promise<void>}
   */
  async execute({ projectRoot, enableExperimentalEditor }) {
    await this.experimentalFeatureService.assertEnabled({
      projectRoot,
      feature: 'editor',
      cliEnabled: enableExperimentalEditor,
      cliHint: 'Use tidypress editor --enable-experimental-editor',
      configHint: 'Set experimental.editor = true in docs/tidypress.config.ts',
    })

    throw new TidyPressError(
      'Experimental editor scaffold is ready, but implementation is not available yet.',
      'EXPERIMENTAL_NOT_IMPLEMENTED',
      'Task 19 keeps stretch work guarded until prerequisites are production-ready.',
      { exitCode: 2 },
    )
  }
}
