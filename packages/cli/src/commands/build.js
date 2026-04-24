/**
 * Handles `docsmint build`.
 */
export class BuildCommand {
  /**
   * @param {{ buildService: import('../services/BuildService.js').BuildService }} dependencies
   */
  constructor({ buildService }) {
    this.buildService = buildService
  }

  /**
   * @param {{ projectRoot: string }} request
   * @returns {Promise<void>}
   */
  async execute({ projectRoot }) {
    await this.buildService.build({ projectRoot })
  }
}
