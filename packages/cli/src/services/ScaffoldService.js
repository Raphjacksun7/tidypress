import path from 'node:path'

import { scaffoldDocs } from '../application/scaffolding/scaffold-docs.js'
import { getDocsDir } from '../infrastructure/project/config.js'
import { DocsMintError } from '../errors/DocsMintError.js'

/**
 * Creates initial docs/writing scaffolding for a project.
 */
export class ScaffoldService {
  /**
   * @param {{ projectRoot: string, starterPreset?: string }} request
   * @returns {Promise<{ docsDir: string, starterPreset: string }>}
   */
  async scaffold({ projectRoot, starterPreset }) {
    const docsDir = getDocsDir(projectRoot)
    const projectName = path.basename(projectRoot)
    try {
      await scaffoldDocs({ docsDir, projectName, starterPreset })
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Unknown starter preset')) {
        throw new DocsMintError(
          error.message,
          'INVALID_INIT_OPTION',
          'Use docsmint init [--preset default]',
          { exitCode: 2 },
        )
      }
      throw error
    }
    return { docsDir, starterPreset: starterPreset ?? 'default' }
  }
}
