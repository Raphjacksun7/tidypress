import path from 'node:path'

import { getDocsDir } from '../utils/config.js'
import { scaffoldDocs } from '../utils/scaffold.js'

/**
 * Creates initial docs/writing scaffolding for a project.
 */
export class ScaffoldService {
  /**
   * @param {{ projectRoot: string }} request
   * @returns {Promise<{ docsDir: string }>}
   */
  async scaffold({ projectRoot }) {
    const docsDir = getDocsDir(projectRoot)
    const projectName = path.basename(projectRoot)
    await scaffoldDocs({ docsDir, projectName })
    return { docsDir }
  }
}
