import { TidyPressError } from '../errors/TidyPressError.js'

/**
 * Handles `tidypress export` (stretch scaffold).
 */
export class ExportCommand {
  experimentalFeatureService: any


  /**
   * @param {{ experimentalFeatureService: import('../services/ExperimentalFeatureService.js').ExperimentalFeatureService }} dependencies
   */
  constructor({ experimentalFeatureService }) {
    this.experimentalFeatureService = experimentalFeatureService
  }

  /**
   * @param {{
   *   projectRoot: string
   *   enableExperimentalExport: boolean
   *   format: 'pdf' | 'epub' | 'archive'
   *   source?: string
   * }} request
   * @returns {Promise<void>}
   */
  async execute({ projectRoot, enableExperimentalExport, format }) {
    await this.experimentalFeatureService.assertEnabled({
      projectRoot,
      feature: 'export',
      cliEnabled: enableExperimentalExport,
      cliHint: 'Use tidypress export <pdf|epub|archive> [source] --enable-experimental-export',
      configHint: 'Set experimental.export = true in docs/tidypress.config.ts',
    })

    throw new TidyPressError(
      `Experimental export (${format}) scaffold is ready, but implementation is not available yet.`,
      'EXPERIMENTAL_NOT_IMPLEMENTED',
      'Task 19 keeps stretch work guarded until prerequisites are production-ready.',
      { exitCode: 2 },
    )
  }
}
