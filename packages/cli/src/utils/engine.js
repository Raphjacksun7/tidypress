import fs from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

/**
 * @returns {string}
 */
export function getEnginePath() {
  const packageJsonPath = require.resolve('@docsmint/engine/package.json')
  return path.dirname(packageJsonPath)
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

async function ensureEngineCopied(workdir) {
  if (await exists(path.join(workdir, 'package.json'))) {
    return
  }

  const enginePath = getEnginePath()
  await ensureFreshDirectory(workdir)
  await fs.cp(enginePath, workdir, { recursive: true })
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
 * @param {{ docsDir: string, mode: 'dev' | 'build' | 'preview' }} options
 * @returns {Promise<string>}
 */
export async function prepareWorkdir({ docsDir, mode }) {
  const workdir = getWorkdir(docsDir)
  const configPath = path.resolve(docsDir, 'docsmint.config.ts')
  const contentPath = path.resolve(docsDir, 'src/content')

  await ensureEngineCopied(workdir)
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

  return workdir
}
