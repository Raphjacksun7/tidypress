/**
 * Handles `tidypress init`.
 */
export class InitCommand {
  /**
   * @param {{ scaffoldService: import('../services/ScaffoldService.js').ScaffoldService, io: { info: (message: string) => void } }} dependencies
   */
  constructor({ scaffoldService, io }) {
    this.scaffoldService = scaffoldService
    this.io = io
  }

  /**
   * @param {{ projectRoot: string, starterPreset?: string }} request
   * @returns {Promise<void>}
   */
  async execute(request) {
    const { docsDir, starterPreset } = await this.scaffoldService.scaffold(request)
    this.io.info(`Initialized TidyPress in ${docsDir} (starter: ${starterPreset})`)
  }
}
