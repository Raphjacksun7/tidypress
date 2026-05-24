import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

import { getWorkdir, prepareWorkdir } from '../infrastructure/engine/workdir.js'
import { runCommand } from '../infrastructure/process/run-command.js'

const require = createRequire(import.meta.url)

function resolvePackageRoot(packageName) {
  try {
    return path.dirname(require.resolve(`${packageName}/package.json`))
  } catch {
    let current = path.dirname(fileURLToPath(import.meta.url))
    while (current !== path.dirname(current)) {
      const candidate = path.join(current, 'node_modules', packageName, 'package.json')
      try {
        require(candidate)
        return path.dirname(candidate)
      } catch {
        current = path.dirname(current)
      }
    }
    throw new Error(`Unable to resolve ${packageName} package root.`)
  }
}

function resolveAstroBin() {
  return path.join(resolvePackageRoot('astro'), 'bin/astro.mjs')
}

function resolvePagefindBin() {
  return path.join(resolvePackageRoot('pagefind'), 'lib/runner/bin.cjs')
}

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
      command: process.execPath,
      args: [resolveAstroBin(), 'dev', '--port', String(port)],
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
      command: process.execPath,
      args: [resolveAstroBin(), 'build'],
      cwd: workdir,
      env: { DOCSMINT_PROJECT_ROOT: docsDir },
    })
    await runCommand({
      command: process.execPath,
      args: [resolvePagefindBin(), '--site', 'dist'],
      cwd: workdir,
    })
  }

  /**
   * @param {{ workdir: string, port: number }} options
   * @returns {Promise<void>}
   */
  async runPreview({ workdir, port, docsDir }) {
    await runCommand({
      command: process.execPath,
      args: [resolveAstroBin(), 'preview', '--port', String(port)],
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
