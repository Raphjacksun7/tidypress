import fs from 'node:fs/promises'
import path from 'node:path'

import { migrateSectionsToCollections } from '@docsmint/config'

/**
 * Generates deterministic sections->collections migration output.
 */
export class SectionsMigrationService {
  /**
   * @param {{ configLoader: import('./ConfigLoader.js').ConfigLoader }} dependencies
   */
  constructor({ configLoader }) {
    this.configLoader = configLoader
  }

  /**
   * @param {{ projectRoot: string }} request
   * @returns {Promise<{ migrated: boolean, outputPath: string, notes: string[] }>}
   */
  async run({ projectRoot }) {
    const docsDir = await this.configLoader.resolveDocsDirectory({ projectRoot })
    const rawConfig = await this.configLoader.loadConfig({ docsDir })
    const result = migrateSectionsToCollections(rawConfig)
    const outputDir = path.join(docsDir, '.docsmint', 'migrations')
    const outputPath = path.join(outputDir, 'sections-to-collections.json')
    await fs.mkdir(outputDir, { recursive: true })

    const payload = {
      migrated: result.migrated,
      notes: result.notes,
      collections: result.config.collections ?? {},
      removeSections: true,
    }
    await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
    return {
      migrated: result.migrated,
      outputPath,
      notes: result.notes,
    }
  }
}

