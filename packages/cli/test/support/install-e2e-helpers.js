import { execFile } from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

/** Repo root (tidypress-workspace). */
export const repoRoot = path.resolve(import.meta.dirname, '../../../..')

/**
 * @param {string} command
 * @param {string[]} args
 * @param {{ cwd?: string, env?: NodeJS.ProcessEnv }} [options]
 */
export async function runCommand(command, args, options = {}) {
  const { cwd = repoRoot, env = process.env } = options
  const { stdout, stderr } = await execFileAsync(command, args, {
    cwd,
    env,
    maxBuffer: 20 * 1024 * 1024,
  })
  return { stdout: stdout ?? '', stderr: stderr ?? '' }
}

let packedTarballPromise

/**
 * Build @tidypress/config and npm-pack the tidypress CLI (bundled engine + config).
 * @returns {Promise<string>} Absolute path to tidypress-*.tgz
 */
export async function packTidyPressTarball() {
  if (!packedTarballPromise) {
    packedTarballPromise = (async () => {
      await runCommand('pnpm', ['--filter', '@tidypress/config', 'build'])
      const packDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tidypress-pack-'))
      await runCommand('npm', ['pack', '--pack-destination', packDir], {
        cwd: path.join(repoRoot, 'packages/cli'),
      })
      const files = await fs.readdir(packDir)
      const tarball = files.find(name => /^tidypress-.*\.tgz$/.test(name))
      if (!tarball) {
        throw new Error(`npm pack produced no tidypress tarball in ${packDir}`)
      }
      return path.join(packDir, tarball)
    })()
  }
  return packedTarballPromise
}

/**
 * @param {string} tarball
 * @returns {Promise<{ installRoot: string, cliPath: string }>}
 */
export async function installTidyPressTarball(tarball) {
  const installRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'tidypress-installed-'))
  await runCommand('npm', ['install', tarball], { cwd: installRoot })
  const cliPath = path.join(installRoot, 'node_modules', 'tidypress', 'bin', 'tidypress.js')
  await fs.access(cliPath)
  return { installRoot, cliPath }
}

/**
 * @param {string} cliPath
 * @param {string[]} args
 * @param {string} cwd
 */
export async function runInstalledCli(cliPath, args, cwd) {
  const { stdout, stderr } = await execFileAsync(process.execPath, [cliPath, ...args], {
    cwd,
    env: {
      ...process.env,
      CI: process.env.CI ?? 'true',
      TIDYPRESS_JSON_LOGS: '1',
    },
    maxBuffer: 20 * 1024 * 1024,
  })
  return { stdout: stdout ?? '', stderr: stderr ?? '' }
}

/**
 * Fresh project: npm install tarball, tidypress init, tidypress build.
 * @param {string} tarball
 * @param {string} preset
 * @returns {Promise<{ siteRoot: string, docsDir: string, buildDir: string, cliPath: string }>}
 */
export async function scaffoldInstalledPresetSite(tarball, preset) {
  const { installRoot, cliPath } = await installTidyPressTarball(tarball)
  const siteRoot = path.join(installRoot, 'site')
  await fs.mkdir(siteRoot, { recursive: true })
  await runInstalledCli(cliPath, ['init', '--preset', preset], siteRoot)
  const docsDir = path.join(siteRoot, 'docs')
  const configPath = path.join(docsDir, 'tidypress.config.ts')
  await fs.access(configPath)
  await runInstalledCli(cliPath, ['build'], siteRoot)
  const buildDir = path.join(docsDir, 'build')
  await fs.access(path.join(buildDir, 'index.html'))
  return { siteRoot, docsDir, buildDir, cliPath }
}
