/**
 * Handles `docsmint clean`.
 */
export class CleanCommand {
  /**
   * @param {{ cleanService: import('../services/CleanService.js').CleanService, io: { info: (message: string) => void } }} dependencies
   */
  constructor({ cleanService, io }) {
    this.cleanService = cleanService
    this.io = io
  }

  /**
   * @param {{ projectRoot: string }} request
   * @returns {Promise<void>}
   */
  async execute({ projectRoot }) {
    const { workdir } = await this.cleanService.clean({ projectRoot })
    this.io.info(`Cleaned ${workdir}`)
  }
}
