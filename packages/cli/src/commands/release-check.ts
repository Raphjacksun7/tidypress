/**
 * Handles `tidypress release-check`.
 */
export class ReleaseCheckCommand {
  releaseCheckService: any
  io: any


  /**
   * @param {{ releaseCheckService: import('../services/ReleaseCheckService.js').ReleaseCheckService, io: { info: (message: string) => void } }} dependencies
   */
  constructor({ releaseCheckService, io }) {
    this.releaseCheckService = releaseCheckService
    this.io = io
  }

  /**
   * @returns {Promise<void>}
   */
  async execute() {
    const summary = this.releaseCheckService.run()
    this.io.info(`Release check OK for ${summary.name}@${summary.version}`)
  }
}
