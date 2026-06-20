import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import sitemap from '@astrojs/sitemap'
import { mergeConfig, logHandlers } from 'astro/config'
import {
  resolveProductionSiteUrl,
  withDefaults,
  type TidyPressConfig,
} from '@tidypress/config'
import { loadUserConfig } from '../project/config.js'
import { mountProjectPaths, writePluginManifest } from './plugin-manifest.js'

const require = createRequire(import.meta.url)

/**
 * Resolve bundled workspace packages when tidypress is installed from npm
 * (nested under node_modules/tidypress, not hoisted to the project root).
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
 * Ensure user config imports like `from 'tidypress'` or `from 'tidypress/config'`
 * resolve even when running via `npx tidypress` (package lives in npm cache, not
 * project node_modules).
 *
 * Instead of symlinking the full CLI package (which can confuse bundlers), create
 * a tiny local shim package that re-exports runtime files from the active CLI.
 *
 * @param {string} docsDir
 */
async function ensureRuntimeTidypressShim(docsDir) {
  const cliPackageRoot = resolveBundledPackageRoot('tidypress')
  if (!cliPackageRoot) {
    return
  }

  const nodeModulesDir = path.join(docsDir, 'node_modules')
  const tidypressDir = path.join(nodeModulesDir, 'tidypress')
  const packageJsonPath = path.join(tidypressDir, 'package.json')
  if (await exists(packageJsonPath)) {
    return
  }

  const cliDistDir = path.join(cliPackageRoot, 'dist')
  const configModuleUrl = pathToFileURL(path.join(cliDistDir, 'config.js')).href

  await fs.mkdir(path.join(tidypressDir, 'dist'), { recursive: true })
  await fs.writeFile(
    packageJsonPath,
    JSON.stringify(
      {
        name: 'tidypress',
        private: true,
        type: 'module',
        exports: {
          '.': {
            import: './dist/index.js',
            default: './dist/index.js',
          },
          './config': {
            import: './dist/config.js',
            default: './dist/config.js',
          },
        },
      },
      null,
      2,
    ) + '\n',
    'utf8',
  )
  await fs.writeFile(
    path.join(tidypressDir, 'dist/index.js'),
    `export * from ${JSON.stringify(configModuleUrl)}\n`,
    'utf8',
  )
  await fs.writeFile(
    path.join(tidypressDir, 'dist/config.js'),
    `export * from ${JSON.stringify(configModuleUrl)}\n`,
    'utf8',
  )
}

/**
 * @returns {string}
 */
export function getEnginePath() {
  const packageJsonPath = require.resolve('@tidypress/engine/package.json')
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
    return path.join(xdg, 'tidypress')
  }
  return path.join(os.homedir(), '.cache', 'tidypress')
}

/** @param {string} targetPath */
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
  return path.resolve(docsDir, '.tidypress')
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
  const manifestPath = path.join(codegenDir, 'tidypress-plugins.mjs')

  await fs.mkdir(codegenDir, { recursive: true })
  await fs.mkdir(path.join(cacheDir, 'astro'), { recursive: true })

  await ensureRuntimeTidypressShim(docsDir)

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
export async function resolveAstroInlineConfig({
  session,
  port,
}: {
  session: Awaited<ReturnType<typeof prepareBuildSession>>
  port?: number
}) {
  const { docsDir, engineRoot, buildDir, cacheDir, publicDir, manifestPath } = session
  const siteConfigPath = path.resolve(docsDir, 'tidypress.config.ts')
  const srcDir = path.join(engineRoot, 'src')
  const engineGenerated = path.join(engineRoot, 'src', 'generated', 'tidypress-plugins.mjs')
  const rawConfig = await loadUserConfig(docsDir)
  const productionSite = resolveProductionSiteUrl(withDefaults(rawConfig as TidyPressConfig))

  const configUrl = pathToFileURL(path.join(engineRoot, 'astro.config.mjs')).href
  const { default: baseConfig } = await import(/* @vite-ignore */ configUrl)

  const useJsonLogs =
    process.env.CI === 'true' || process.env.TIDYPRESS_JSON_LOGS === '1'

  const configPackageRoot = resolveBundledPackageRoot('@tidypress/config')
  const viteAliases = {
    '@site-config': siteConfigPath,
    '@project': docsDir,
    '@/generated/tidypress-plugins.mjs': manifestPath,
    [path.join(srcDir, 'generated', 'tidypress-plugins.mjs')]: manifestPath,
  }
  if (configPackageRoot) {
    viteAliases['@tidypress/config'] = configPackageRoot
  }

  return mergeConfig(typeof baseConfig === 'function' ? baseConfig({}) : baseConfig, {
    ...(productionSite
      ? {
          site: productionSite,
          integrations: [sitemap()],
        }
      : {}),
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
        noExternal: configPackageRoot ? ['@tidypress/config'] : [],
      },
      define: {
        'import.meta.env.TIDYPRESS_PROJECT_ROOT': JSON.stringify(docsDir),
        'import.meta.env.TIDYPRESS_MANIFEST_PATH': JSON.stringify(manifestPath),
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
    TIDYPRESS_PROJECT_ROOT: session.docsDir,
    TIDYPRESS_CACHE_DIR: session.cacheDir,
    TIDYPRESS_MANIFEST_PATH: session.manifestPath,
    TIDYPRESS_BUILD_DIR: session.buildDir,
  }
}

/**
 * @param {{ docsDir: string, mode?: 'dev' | 'build' | 'preview' }} options
 * @deprecated Use prepareBuildSession
 */
export async function prepareWorkdir(options) {
  const session = await prepareBuildSession({
    docsDir: options.docsDir,
    mode: options.mode ?? 'build',
  })
  return session.engineRoot
}
