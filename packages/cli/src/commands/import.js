/**
 * Handles `docsmint import`.
 */
export class ImportCommand {
  /**
   * @param {{ importService: import('../services/ImportService.js').ImportService, io: { info: (message: string) => void } }} dependencies
   */
  constructor({ importService, io }) {
    this.importService = importService
    this.io = io
  }

  /**
   * @param {{ projectRoot: string, provider: 'medium' | 'devto' | 'substack' | 'ghost', source: string, scheduled?: string }} request
   * @returns {Promise<void>}
   */
  async execute({ projectRoot, provider, source, scheduled }) {
    const result = await this.importService.run({
      projectRoot,
      provider,
      source,
      scheduled,
    })
    if (result.imported) {
      this.io.info(`Imported ${provider} article at ${result.outputPath}`)
    } else {
      this.io.info(`Imported scaffold (${provider}) created at ${result.outputPath}`)
    }
  }
}
