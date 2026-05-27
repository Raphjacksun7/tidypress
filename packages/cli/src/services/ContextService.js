import path from 'node:path'

import { withDefaults } from '@tidypress/config'
import { writeContentSnapshot } from '../application/content/context-snapshot.js'

/**
 * Generates context snapshots for LLM workflows.
 */
export class ContextService {
  /**
   * @param {{ configLoader: import('./ConfigLoader.js').ConfigLoader }} dependencies
   */
  constructor({ configLoader }) {
    this.configLoader = configLoader
  }

  /**
   * @param {{ projectRoot: string, outputPath?: string }} request
   * @returns {Promise<{ count: number, outputPath: string }>}
   */
  async generate({ projectRoot, outputPath }) {
    const docsDir = await this.configLoader.resolveDocsDirectory({ projectRoot })
    const rawConfig = await this.configLoader.loadConfig({ docsDir })
    const config = withDefaults(rawConfig)
    const resolvedOutput = outputPath ?? path.resolve(projectRoot, 'tidypress-context.md')
    const count = await writeContentSnapshot({
      docsDir,
      outputPath: resolvedOutput,
      config: {
        collections: config.collections,
        capabilities: config.capabilities,
        experimental: config.experimental,
      },
    })
    return { count, outputPath: resolvedOutput }
  }
}
