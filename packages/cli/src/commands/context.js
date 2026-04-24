/**
 * Handles `docsmint context`.
 */
export class ContextCommand {
  /**
   * @param {{ contextService: import('../services/ContextService.js').ContextService, io: { info: (message: string) => void } }} dependencies
   */
  constructor({ contextService, io }) {
    this.contextService = contextService
    this.io = io
  }

  /**
   * @param {{ projectRoot: string, outputPath?: string }} request
   * @returns {Promise<void>}
   */
  async execute({ projectRoot, outputPath }) {
    const { count, outputPath: resolvedPath } = await this.contextService.generate({
      projectRoot,
      outputPath,
    })
    this.io.info(`Wrote ${count} entries to ${resolvedPath}`)
  }
}
