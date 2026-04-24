import path from 'node:path'

import { writeContentSnapshot } from '../utils/context.js'

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
    const resolvedOutput = outputPath ?? path.resolve(projectRoot, 'docsmint-context.md')
    const count = await writeContentSnapshot({ docsDir, outputPath: resolvedOutput })
    return { count, outputPath: resolvedOutput }
  }
}
