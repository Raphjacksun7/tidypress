import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build, dev, preview } from 'astro'

import {
  buildSessionEnv,
  getBuildDir,
  getEnginePath,
  prepareBuildSession,
  resolveAstroInlineConfig,
} from '../infrastructure/engine/build-session.js'
import { runCommand } from '../infrastructure/process/run-command.js'

function resolvePagefindBin() {
  let dir = path.dirname(fileURLToPath(import.meta.url))
  while (dir !== path.dirname(dir)) {
    const candidate = path.join(dir, 'node_modules/pagefind/lib/runner/bin.cjs')
    if (fs.existsSync(candidate)) {
      return candidate
    }
    dir = path.dirname(dir)
  }
  throw new Error('Could not locate pagefind. Ensure the docsmint CLI is installed with its dependencies.')
}

/** @type {import('astro').DevServer | null} */
let activeDevServer = null

/** @type {import('astro').PreviewServer | null} */
let activePreviewServer = null

/**
 * @param {Record<string, string>} env
 * @param {() => Promise<void>} run
 */
async function withSessionEnv(env, run) {
  const previous = /** @type {Record<string, string | undefined>} */ ({})
  for (const [key, value] of Object.entries(env)) {
    previous[key] = process.env[key]
    process.env[key] = value
  }
  try {
    await run()
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = value
      }
    }
  }
}

function registerShutdown(server) {
  const stop = async () => {
    await server.stop()
    process.exit(0)
  }
  process.once('SIGINT', stop)
  process.once('SIGTERM', stop)
}

/**
 * Coordinates engine build sessions and programmatic Astro commands.
 */
export class EngineManager {
  /**
   * @param {{ docsDir: string, mode: 'dev' | 'build' | 'preview' }} options
   * @returns {Promise<Awaited<ReturnType<typeof prepareBuildSession>>>}
   */
  async prepare({ docsDir, mode }) {
    return prepareBuildSession({ docsDir, mode })
  }

  /**
   * @param {{ docsDir: string }} options
   * @returns {string}
   */
  getBuildDirectory({ docsDir }) {
    return getBuildDir(docsDir)
  }

  /** @deprecated Use getBuildDirectory */
  getWorkdir({ docsDir }) {
    return getEnginePath()
  }

  /** @deprecated Use getBuildDirectory */
  getDistDirectory({ docsDir }) {
    return getBuildDir(docsDir)
  }

  /**
   * @param {{ session: Awaited<ReturnType<typeof prepareBuildSession>>, port: number }} options
   * @returns {Promise<void>}
   */
  async runDev({ session, port }) {
    if (activeDevServer) {
      await activeDevServer.stop()
      activeDevServer = null
    }

    await withSessionEnv(buildSessionEnv(session), async () => {
      const inlineConfig = await resolveAstroInlineConfig({ session, port })
      activeDevServer = await dev({
        ...inlineConfig,
        root: session.engineRoot,
        configFile: false,
      })
      registerShutdown(activeDevServer)
      await new Promise(() => {})
    })
  }

  /**
   * @param {{ session: Awaited<ReturnType<typeof prepareBuildSession>> }} options
   * @returns {Promise<void>}
   */
  async runBuild({ session }) {
    await withSessionEnv(buildSessionEnv(session), async () => {
      const inlineConfig = await resolveAstroInlineConfig({ session })
      await build({
        ...inlineConfig,
        root: session.engineRoot,
        configFile: false,
      })
      await runCommand({
        command: process.execPath,
        args: [resolvePagefindBin(), '--site', session.buildDir],
        cwd: session.engineRoot,
        env: buildSessionEnv(session),
      })
    })
  }

  /**
   * @param {{ session: Awaited<ReturnType<typeof prepareBuildSession>>, port: number }} options
   * @returns {Promise<void>}
   */
  async runPreview({ session, port }) {
    if (activePreviewServer) {
      await activePreviewServer.stop()
      activePreviewServer = null
    }

    await withSessionEnv(buildSessionEnv(session), async () => {
      const inlineConfig = await resolveAstroInlineConfig({ session, port })
      activePreviewServer = await preview({
        ...inlineConfig,
        root: session.engineRoot,
        configFile: false,
      })
      registerShutdown(activePreviewServer)
      await new Promise(() => {})
    })
  }
}
