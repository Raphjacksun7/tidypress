/**
 * Handles `tidypress doctor`.
 */
export class DoctorCommand {
  /**
   * @param {{ doctorService: import('../services/DoctorService.js').DoctorService, io: { info: (message: string) => void } }} dependencies
   */
  constructor({ doctorService, io }) {
    this.doctorService = doctorService
    this.io = io
  }

  /**
   * @param {{ projectRoot: string }} request
   * @returns {Promise<void>}
   */
  async execute({ projectRoot }) {
    const result = await this.doctorService.run({ projectRoot })
    this.io.info(`Doctor OK: found docs config at ${result.docsDir}`)
  }
}
