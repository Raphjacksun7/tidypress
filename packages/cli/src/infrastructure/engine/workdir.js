import fs from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'
import { loadUserConfig } from '../project/config.js'
import { mountProjectPaths, writePluginManifest } from './plugin-manifest.js'

const require = createRequire(import.meta.url)

/**
 * @returns {string}
 */
export function getEnginePath() {
  const packageJsonPath = require.resolve('@docsmint/engine/package.json')
  return path.dirname(packageJsonPath)
}

function getConfigPath() {
  const packageJsonPath = require.resolve('@docsmint/config/package.json')
  return path.dirname(packageJsonPath)
}

function getDependencyModulesPath() {
  const packageJsonPath = require.resolve('astro/package.json')
  return path.dirname(path.dirname(packageJsonPath))
}

/**
 * @param {string} docsDir
 * @returns {string}
 */
export function getWorkdir(docsDir) {
  return path.resolve(docsDir, '.docsmint')
}

async function exists(targetPath) {
  try {
    await fs.lstat(targetPath)
    return true
  } catch {
    return false
  }
}

async function ensureFreshDirectory(targetDir) {
  await fs.rm(targetDir, { recursive: true, force: true })
  await fs.mkdir(targetDir, { recursive: true })
}

async function ensureSymlink(sourcePath, targetPath) {
  if (await exists(targetPath)) {
    return
  }
  try {
    await fs.symlink(sourcePath, targetPath, 'junction')
  } catch (error) {
    if (/** @type {NodeJS.ErrnoException} */ (error).code !== 'EEXIST') {
      throw error
    }
  }
}

const ENGINE_STAMP_FILE = '.engine-stamp'
const ENGINE_SKIP_TOP_LEVEL = new Set(['dist', 'node_modules'])
const WORKDIR_RUNTIME_PACKAGES = [
  '@astrojs/mdx',
  '@astrojs/sitemap',
  '@tailwindcss/vite',
  'astro',
  'jiti',
  'mermaid',
  'pagefind',
  'rehype-external-links',
  'rehype-pretty-code',
  'shiki',
  'tailwindcss',
  'unist-util-visit',
  'vite',
]

/**
 * Detect engine source changes so a stale `.docsmint` workdir is refreshed
 * without requiring a manual `rm -rf .docsmint`.
 *
 * @param {string} enginePath
 * @returns {Promise<string>}
 */
async function maxMtimeInDir(root) {
  let max = 0
  async function walk(dir) {
    for (const ent of await fs.readdir(dir, { withFileTypes: true })) {
      if (ent.name === 'node_modules') {
        continue
      }
      const full = path.join(dir, ent.name)
      if (ent.isDirectory()) {
        await walk(full)
        continue
      }
      const st = await fs.stat(full)
      max = Math.max(max, st.mtimeMs)
    }
  }
  if (await exists(root)) {
    await walk(root)
  }
  return max
}

/**
 * @param {string} enginePath
 * @returns {Promise<string>}
 */
async function getEngineStamp(enginePath) {
  const pkg = JSON.parse(
    await fs.readFile(path.join(enginePath, 'package.json'), 'utf8'),
  )
  const srcMtime = await maxMtimeInDir(path.join(enginePath, 'src'))
  const pluginsMtime = await maxMtimeInDir(path.join(enginePath, 'plugins'))
  const integrationsMtime = await maxMtimeInDir(
    path.join(enginePath, 'integrations'),
  )
  return `${pkg.version}:${srcMtime}:${pluginsMtime}:${integrationsMtime}`
}

/**
 * @param {string} workdir
 * @returns {Promise<string | undefined>}
 */
async function readEngineStamp(workdir) {
  const stampPath = path.join(workdir, ENGINE_STAMP_FILE)
  if (!(await exists(stampPath))) {
    return undefined
  }
  return (await fs.readFile(stampPath, 'utf8')).trim()
}

/**
 * @param {string} enginePath
 * @param {string} workdir
 */
async function copyEnginePackage(enginePath, workdir) {
  await fs.cp(enginePath, workdir, {
    recursive: true,
    filter: sourcePath => {
      const relativePath = path.relative(enginePath, sourcePath)
      if (relativePath === '') {
        return true
      }
      const [topLevel] = relativePath.split(path.sep)
      return !ENGINE_SKIP_TOP_LEVEL.has(topLevel)
    },
  })
}

/**
 * Refresh engine-owned paths in an existing workdir (keeps installed deps).
 *
 * @param {string} enginePath
 * @param {string} workdir
 */
async function syncEnginePackage(enginePath, workdir) {
  for (const ent of await fs.readdir(enginePath, { withFileTypes: true })) {
    if (ENGINE_SKIP_TOP_LEVEL.has(ent.name)) {
      continue
    }
    await replacePath(
      path.join(workdir, ent.name),
      path.join(enginePath, ent.name),
      'copy',
    )
  }
}

async function ensureEngineCopied(workdir) {
  const enginePath = getEnginePath()
  const stamp = await getEngineStamp(enginePath)
  const existingStamp = await readEngineStamp(workdir)
  const hasPackage = await exists(path.join(workdir, 'package.json'))

  if (hasPackage && existingStamp === stamp) {
    return
  }

  if (!hasPackage) {
    await ensureFreshDirectory(workdir)
    await copyEnginePackage(enginePath, workdir)
  } else {
    await syncEnginePackage(enginePath, workdir)
  }

  await fs.writeFile(path.join(workdir, ENGINE_STAMP_FILE), `${stamp}\n`)
}

/**
 * In the monorepo, reuse the resolved engine package's `node_modules` so a
 * fresh `.docsmint` workdir can build without a separate install step.
 *
 * @param {string} workdir
 */
async function ensureWorkdirNodeModules(workdir) {
  const astroBin = path.join(workdir, 'node_modules', '.bin', 'astro')
  if (await exists(astroBin)) {
    return
  }

  const engineModules = path.join(getEnginePath(), 'node_modules')
  const workdirModules = path.join(workdir, 'node_modules')

  if (
    (await exists(path.join(engineModules, '.bin', 'astro'))) &&
    !(await exists(workdirModules))
  ) {
    await ensureSymlink(engineModules, workdirModules)
    return
  }

  await fs.mkdir(workdirModules, { recursive: true })

  for (const [name, sourcePath] of [
    ['@docsmint/config', getConfigPath()],
    ['@docsmint/engine', getEnginePath()],
  ]) {
    const targetPath = path.join(workdirModules, ...name.split('/'))
    if (!(await exists(targetPath))) {
      await fs.mkdir(path.dirname(targetPath), { recursive: true })
      await ensureSymlink(sourcePath, targetPath)
    }
  }

  const dependencyModules = getDependencyModulesPath()
  for (const packageName of WORKDIR_RUNTIME_PACKAGES) {
    const sourcePath = path.join(dependencyModules, ...packageName.split('/'))
    const targetPath = path.join(workdirModules, ...packageName.split('/'))
    if ((await exists(sourcePath)) && !(await exists(targetPath))) {
      await fs.mkdir(path.dirname(targetPath), { recursive: true })
      await ensureSymlink(sourcePath, targetPath)
    }
  }
}

async function replacePath(targetPath, sourcePath, mode) {
  await fs.rm(targetPath, { recursive: true, force: true })
  await fs.mkdir(path.dirname(targetPath), { recursive: true })

  if (mode === 'symlink') {
    await fs.symlink(sourcePath, targetPath, 'junction')
    return
  }

  await fs.cp(sourcePath, targetPath, { recursive: true })
}

/**
 * Merge project `public/` over the engine defaults (favicons, etc.).
 * Files in `docs/public/` are served at the site root, same as Astro's `public/`.
 *
 * @param {{ docsDir: string, workdir: string }} options
 */
async function overlayUserPublic({ docsDir, workdir }) {
  const userPublic = path.resolve(docsDir, 'public')
  if (!(await exists(userPublic))) {
    return
  }
  const workdirPublic = path.resolve(workdir, 'public')
  await fs.mkdir(workdirPublic, { recursive: true })
  await fs.cp(userPublic, workdirPublic, { recursive: true })
}

/**
 * @param {{ docsDir: string, mode: 'dev' | 'build' | 'preview' }} options
 * @returns {Promise<string>}
 */
export async function prepareWorkdir({ docsDir, mode }) {
  const workdir = getWorkdir(docsDir)
  const configPath = path.resolve(docsDir, 'docsmint.config.ts')
  const contentPath = path.resolve(docsDir, 'src/content')

  await ensureEngineCopied(workdir)
  await ensureWorkdirNodeModules(workdir)
  await replacePath(
    path.resolve(workdir, 'docsmint.config.ts'),
    configPath,
    mode === 'dev' ? 'symlink' : 'copy',
  )
  await replacePath(
    path.resolve(workdir, 'src/content'),
    contentPath,
    mode === 'dev' ? 'symlink' : 'copy',
  )
  await overlayUserPublic({ docsDir, workdir })

  const rawConfig = await loadUserConfig(docsDir)
  const { pathsToMount } = await writePluginManifest({ docsDir, config: rawConfig, workdir })
  await mountProjectPaths(docsDir, pathsToMount, mode)

  return workdir
}
