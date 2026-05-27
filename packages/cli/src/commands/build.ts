/**
 * Handles `tidypress build`.
 */
export class BuildCommand {
  buildService: any


  /**
   * @param {{ buildService: import('../services/BuildService.js').BuildService }} dependencies
   */
  constructor({ buildService }) {
    this.buildService = buildService
  }

  /**
   * @param {{ projectRoot: string, outputPath?: string }} request
   * @returns {Promise<void>}
   */
  async execute({ projectRoot, outputPath }) {
    await this.buildService.build({ projectRoot, outputPath })
  }
}
