import path from 'node:path'

import { scaffoldDocs } from '../application/scaffolding/scaffold-docs.js'
import { STARTER_PRESETS } from '../templates/starters.js'
import { getDocsDir } from '../infrastructure/project/config.js'
import { TidyPressError } from '../errors/TidyPressError.js'

/**
 * Creates initial docs/writing scaffolding for a project.
 */
export class ScaffoldService {
  /**
   * @param {{ projectRoot: string, starterPreset?: string, withAstro?: boolean, siteUrl?: string }} request
   * @returns {Promise<{ docsDir: string, starterPreset: string }>}
   */
  async scaffold({ projectRoot, starterPreset, withAstro, siteUrl }) {
    const docsDir = getDocsDir(projectRoot)
    const projectName = path.basename(projectRoot)
    try {
      await scaffoldDocs({ docsDir, projectName, starterPreset, withAstro, siteUrl })
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Unknown starter preset')) {
        throw new TidyPressError(
          error.message,
          'INVALID_INIT_OPTION',
          `Use tidypress init [--preset ${Object.keys(STARTER_PRESETS).join('|')}]`,
          { exitCode: 2 },
        )
      }
      throw error
    }
    return { docsDir, starterPreset: starterPreset ?? 'default' }
  }
}
