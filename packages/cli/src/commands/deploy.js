/**
 * Handles `docsmint deploy`.
 */
export class DeployCommand {
  /**
   * @param {{
   *   buildService: import('../services/BuildService.js').BuildService
   *   deployService: import('../services/DeployService.js').DeployService
   *   io: { info: (message: string) => void }
   * }} dependencies
   */
  constructor({ buildService, deployService, io }) {
    this.buildService = buildService
    this.deployService = deployService
    this.io = io
  }

  /**
   * @param {{ projectRoot: string, target?: string }} request
   * @returns {Promise<void>}
   */
  async execute({ projectRoot, target }) {
    const { distDir } = await this.buildService.build({ projectRoot })
    await this.deployService.deploy({ projectRoot, distDir, target })

    if (target) {
      this.io.info(`Deploy flow completed for target: ${target}`)
      return
    }
    this.io.info('Deploy flow completed.')
  }
}
