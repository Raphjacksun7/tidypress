import path from 'node:path'

import { getWorkdir, prepareWorkdir } from '../infrastructure/engine/workdir.js'
import { runCommand } from '../infrastructure/process/run-command.js'

/**
 * Coordinates engine workspace preparation and Astro command execution.
 */
export class EngineManager {
  /**
   * @param {{ docsDir: string, mode: 'dev' | 'build' | 'preview' }} options
   * @returns {Promise<string>}
   */
  async prepare({ docsDir, mode }) {
    return prepareWorkdir({ docsDir, mode })
  }

  /**
   * @param {{ docsDir: string }} options
   * @returns {string}
   */
  getWorkdir({ docsDir }) {
    return getWorkdir(docsDir)
  }

  /**
   * @param {{ workdir: string, port: number }} options
   * @returns {Promise<void>}
   */
  async runDev({ workdir, port, docsDir }) {
    await runCommand({
      command: 'pnpm',
      args: ['astro', 'dev', '--port', String(port)],
      cwd: workdir,
      env: { DOCSMINT_PROJECT_ROOT: docsDir },
    })
  }

  /**
   * @param {{ workdir: string }} options
   * @returns {Promise<void>}
   */
  async runBuild({ workdir, docsDir }) {
    await runCommand({
      command: 'pnpm',
      args: ['astro', 'build'],
      cwd: workdir,
      env: { DOCSMINT_PROJECT_ROOT: docsDir },
    })
    await runCommand({
      command: 'pnpm',
      args: ['pagefind', '--site', 'dist'],
      cwd: workdir,
    })
  }

  /**
   * @param {{ workdir: string, port: number }} options
   * @returns {Promise<void>}
   */
  async runPreview({ workdir, port, docsDir }) {
    await runCommand({
      command: 'pnpm',
      args: ['astro', 'preview', '--port', String(port)],
      cwd: workdir,
      env: { DOCSMINT_PROJECT_ROOT: docsDir },
    })
  }

  /**
   * @param {{ docsDir: string }} options
   * @returns {string}
   */
  getDistDirectory({ docsDir }) {
    return path.resolve(this.getWorkdir({ docsDir }), 'dist')
  }
}
