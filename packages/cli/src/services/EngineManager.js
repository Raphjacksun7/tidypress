import path from 'node:path'

import { getWorkdir, prepareWorkdir } from '../utils/engine.js'
import { runCommand } from '../utils/process.js'

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
  async runDev({ workdir, port }) {
    await runCommand({
      command: 'pnpm',
      args: ['astro', 'dev', '--port', String(port)],
      cwd: workdir,
    })
  }

  /**
   * @param {{ workdir: string }} options
   * @returns {Promise<void>}
   */
  async runBuild({ workdir }) {
    await runCommand({
      command: 'pnpm',
      args: ['astro', 'build'],
      cwd: workdir,
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
  async runPreview({ workdir, port }) {
    await runCommand({
      command: 'pnpm',
      args: ['astro', 'preview', '--port', String(port)],
      cwd: workdir,
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
