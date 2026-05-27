/**
 * Handles `tidypress migrate-sections`.
 */
export class MigrateSectionsCommand {
  /**
   * @param {{ sectionsMigrationService: import('../services/SectionsMigrationService.js').SectionsMigrationService, io: { info: (message: string) => void } }} dependencies
   */
  constructor({ sectionsMigrationService, io }) {
    this.sectionsMigrationService = sectionsMigrationService
    this.io = io
  }

  /**
   * @param {{ projectRoot: string }} request
   * @returns {Promise<void>}
   */
  async execute({ projectRoot }) {
    const result = await this.sectionsMigrationService.run({ projectRoot })
    if (result.migrated) {
      this.io.info('Generated sections->collections migration output.')
    } else {
      this.io.info('No legacy sections found; generated no-op migration output.')
    }
    this.io.info(`Migration file: ${result.outputPath}`)
  }
}

