import { DocsMintError } from '../errors/DocsMintError.js'

/**
 * Handles `docsmint editor` (stretch scaffold).
 */
export class EditorCommand {
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
      cliHint: 'Use docsmint editor --enable-experimental-editor',
      configHint: 'Set experimental.editor = true in docs/docsmint.config.ts',
    })

    throw new DocsMintError(
      'Experimental editor scaffold is ready, but implementation is not available yet.',
      'EXPERIMENTAL_NOT_IMPLEMENTED',
      'Task 19 keeps stretch work guarded until prerequisites are production-ready.',
      { exitCode: 2 },
    )
  }
}
