/**
 * Handles `docsmint init`.
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
   * @param {{ projectRoot: string }} request
   * @returns {Promise<void>}
   */
  async execute(request) {
    const { docsDir } = await this.scaffoldService.scaffold(request)
    this.io.info(`Initialized DocsMint in ${docsDir}`)
  }
}
