import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { mergeConfig, logHandlers } from 'astro/config'
import { loadUserConfig } from '../project/config.js'
import { mountProjectPaths, writePluginManifest } from './plugin-manifest.js'

const require = createRequire(import.meta.url)

/**
 * Resolve bundled workspace packages when docsmint is installed from npm
 * (nested under node_modules/docsmint, not hoisted to the project root).
 * @param {string} packageName
 * @returns {string | undefined}
 */
function resolveBundledPackageRoot(packageName) {
  try {
    const entry = require.resolve(packageName, {
      paths: [path.dirname(fileURLToPath(import.meta.url))],
    })
    const packageDir = path.dirname(entry)
    return path.basename(packageDir) === 'dist' ? path.dirname(packageDir) : packageDir
  } catch {
    return undefined
  }
}

/**
 * @returns {string}
 */
export function getEnginePath() {
  const packageJsonPath = require.resolve('@docsmint/engine/package.json')
  return path.dirname(packageJsonPath)
}

/** @deprecated Use getEnginePath */
export const getEngineRoot = getEnginePath

/**
 * @param {string} docsDir
 * @returns {string}
 */
export function getBuildDir(docsDir) {
  return path.resolve(docsDir, 'build')
}

/**
 * @returns {string}
 */
export function getCacheHome() {
  const xdg = process.env.XDG_CACHE_HOME
  if (xdg) {
    return path.join(xdg, 'docsmint')
  }
  return path.join(os.homedir(), '.cache', 'docsmint')
}

async function exists(targetPath) {
  try {
    await fs.lstat(targetPath)
    return true
  } catch {
    return false
  }
}

/**
 * @param {string} docsDir
 * @returns {Promise<string>}
 */
export async function computeCacheKey(docsDir) {
  const enginePath = getEnginePath()
  const pkg = JSON.parse(
    await fs.readFile(path.join(enginePath, 'package.json'), 'utf8'),
  )
  return crypto
    .createHash('sha256')
    .update(path.resolve(docsDir))
    .update(pkg.version)
    .digest('hex')
    .slice(0, 16)
}

/**
 * @param {string} docsDir
 * @returns {Promise<string>}
 */
export async function getCacheDir(docsDir) {
  const key = await computeCacheKey(docsDir)
  return path.join(getCacheHome(), key)
}

/**
 * @param {string} docsDir
 * @returns {string}
 * @deprecated Removed — use getBuildDir
 */
export function getWorkdir(docsDir) {
  return path.resolve(docsDir, '.docsmint')
}

/**
 * @param {{ docsDir: string, engineRoot: string, cacheDir: string }} options
 */
async function prepareMergedPublicDir({ docsDir, engineRoot, cacheDir }) {
  const publicDir = path.join(cacheDir, 'public')
  await fs.rm(publicDir, { recursive: true, force: true })
  const enginePublic = path.join(engineRoot, 'public')
  if (await exists(enginePublic)) {
    await fs.cp(enginePublic, publicDir, { recursive: true })
  } else {
    await fs.mkdir(publicDir, { recursive: true })
  }
  const userPublic = path.resolve(docsDir, 'public')
  if (await exists(userPublic)) {
    await fs.cp(userPublic, publicDir, { recursive: true })
  }
  return publicDir
}

/**
 * @param {{ docsDir: string, mode: 'dev' | 'build' | 'preview' }} options
 * @returns {Promise<{
 *   docsDir: string,
 *   engineRoot: string,
 *   buildDir: string,
 *   cacheDir: string,
 *   publicDir: string,
 *   manifestPath: string,
 * }>}
 */
export async function prepareBuildSession({ docsDir, mode }) {
  const engineRoot = getEnginePath()
  const buildDir = getBuildDir(docsDir)
  const cacheDir = await getCacheDir(docsDir)
  const codegenDir = path.join(cacheDir, 'codegen')
  const manifestPath = path.join(codegenDir, 'docsmint-plugins.mjs')

  await fs.mkdir(codegenDir, { recursive: true })
  await fs.mkdir(path.join(cacheDir, 'astro'), { recursive: true })

  const rawConfig = await loadUserConfig(docsDir)
  const { pathsToMount } = await writePluginManifest({
    docsDir,
    config: rawConfig,
    manifestPath,
  })
  await mountProjectPaths(docsDir, pathsToMount, cacheDir, mode)

  const publicDir = await prepareMergedPublicDir({ docsDir, engineRoot, cacheDir })

  return {
    docsDir,
    engineRoot,
    buildDir,
    cacheDir,
    publicDir,
    manifestPath,
  }
}

/**
 * @param {{
 *   session: Awaited<ReturnType<typeof prepareBuildSession>>,
 *   port?: number,
 * }} options
 * @returns {Promise<import('astro').AstroInlineConfig>}
 */
export async function resolveAstroInlineConfig({ session, port }) {
  const { docsDir, engineRoot, buildDir, cacheDir, publicDir, manifestPath } = session
  const siteConfigPath = path.resolve(docsDir, 'docsmint.config.ts')
  const srcDir = path.join(engineRoot, 'src')
  const engineGenerated = path.join(engineRoot, 'src', 'generated', 'docsmint-plugins.mjs')

  const configUrl = pathToFileURL(path.join(engineRoot, 'astro.config.mjs')).href
  const { default: baseConfig } = await import(configUrl)

  const useJsonLogs =
    process.env.CI === 'true' || process.env.DOCSMINT_JSON_LOGS === '1'

  const configPackageRoot = resolveBundledPackageRoot('@docsmint/config')
  const viteAliases = {
    '@site-config': siteConfigPath,
    '@project': docsDir,
    '@/generated/docsmint-plugins.mjs': manifestPath,
    [path.join(srcDir, 'generated', 'docsmint-plugins.mjs')]: manifestPath,
  }
  if (configPackageRoot) {
    viteAliases['@docsmint/config'] = configPackageRoot
  }

  return mergeConfig(typeof baseConfig === 'function' ? baseConfig({}) : baseConfig, {
    root: engineRoot,
    publicDir,
    outDir: buildDir,
    cacheDir: path.join(cacheDir, 'astro'),
    build: {
      assets: 'assets',
    },
    server: port ? { port } : undefined,
    vite: {
      resolve: {
        alias: viteAliases,
      },
      ssr: {
        noExternal: configPackageRoot ? ['@docsmint/config'] : [],
      },
      define: {
        'import.meta.env.DOCSMINT_PROJECT_ROOT': JSON.stringify(docsDir),
        'import.meta.env.DOCSMINT_MANIFEST_PATH': JSON.stringify(manifestPath),
      },
    },
    experimental: {
      logger: logHandlers.json({ pretty: !useJsonLogs, level: 'info' }),
    },
  })
}

/**
 * Environment variables for Astro child processes (legacy spawn) and config hooks.
 * @param {Awaited<ReturnType<typeof prepareBuildSession>>} session
 */
export function buildSessionEnv(session) {
  return {
    DOCSMINT_PROJECT_ROOT: session.docsDir,
    DOCSMINT_CACHE_DIR: session.cacheDir,
    DOCSMINT_MANIFEST_PATH: session.manifestPath,
    DOCSMINT_BUILD_DIR: session.buildDir,
  }
}

/** @deprecated Use prepareBuildSession */
export async function prepareWorkdir(options) {
  const session = await prepareBuildSession(options)
  return session.engineRoot
}
