/**
 * Handles `tidypress build`.
 */
export class BuildCommand {
  buildService: any
  io: any


  /**
   * @param {{ buildService: import('../services/BuildService.js').BuildService, io?: { info: (message: string) => void } }} dependencies
   */
  constructor({ buildService, io }) {
    this.buildService = buildService
    this.io = io
  }

  /**
   * @param {{ projectRoot: string, outputPath?: string }} request
   * @returns {Promise<void>}
   */
  async execute({ projectRoot, outputPath }) {
    await this.buildService.build({ projectRoot, outputPath })
  }
}
