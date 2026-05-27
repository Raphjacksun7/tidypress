/**
 * Handles `tidypress add-version`.
 */
export class AddVersionCommand {
  addVersionService: any
  io: any


  /**
   * @param {{ addVersionService: import('../services/AddVersionService.js').AddVersionService, io: { info: (message: string) => void } }} dependencies
   */
  constructor({ addVersionService, io }) {
    this.addVersionService = addVersionService
    this.io = io
  }

  /**
   * @param {{ projectRoot: string, versionLabel: string, setLatest: boolean }} request
   * @returns {Promise<void>}
   */
  async execute({ projectRoot, versionLabel, setLatest }) {
    const result = await this.addVersionService.run({
      projectRoot,
      versionLabel,
      setLatest,
    })
    this.io.info(`Version scaffolded at ${result.versionDir}`)
    if (result.latestLinkPath) {
      this.io.info(`Latest alias updated at ${result.latestLinkPath}`)
    }
  }
}
