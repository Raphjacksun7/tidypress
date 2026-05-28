import { execFile } from 'node:child_process'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'

import { repoRoot, resolvePublishRootUnder, runCommand } from './install-e2e-helpers.js'

const execFileAsync = promisify(execFile)

/** Isolated registry e2e roots under repo `.cache/` (gitignored). */
export const registryE2eRoot = path.join(repoRoot, '.cache', 'registry-e2e')

export type PackageManager = 'npm' | 'pnpm' | 'pip'

/**
 * Published version to install from registries (npm/PyPI). Override with TIDYPRESS_REGISTRY_E2E_VERSION.
 */
export async function resolveRegistryTestVersion(): Promise<string> {
  const override = process.env.TIDYPRESS_REGISTRY_E2E_VERSION?.trim()
  if (override) {
    return override.replace(/^v/, '')
  }
  const { stdout } = await runCommand('npm', ['view', 'tidypress', 'version'])
  const version = stdout.trim()
  if (!/^\d+\.\d+\.\d+/.test(version)) {
    throw new Error(`npm view tidypress version returned unexpected value: ${stdout}`)
  }
  return version
}

/**
 * @param {PackageManager} manager
 * @param {string} version
 */
export function registryWorkspaceDir(manager: PackageManager, version: string) {
  const safeVersion = version.replace(/[^0-9.a-z-]/gi, '_')
  return path.join(registryE2eRoot, `${manager}-${safeVersion}`)
}

/**
 * @param {string} workspaceDir
 */
export async function resetRegistryWorkspace(workspaceDir: string) {
  await fs.rm(workspaceDir, { recursive: true, force: true })
  await fs.mkdir(workspaceDir, { recursive: true })
}

/**
 * @param {string} cliPath
 * @param {string[]} args
 * @param {string} cwd
 */
export async function runRegistryCli(cliPath: string, args: string[], cwd: string) {
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
 * @param {string} buildDir
 */
export async function assertLabBuildArtifacts(buildDir: string) {
  await fs.access(path.join(buildDir, 'index.html'))
  await fs.access(path.join(buildDir, 'writing/hello/index.html'))
  await fs.access(path.join(buildDir, 'writing/rss.xml'))
  await fs.access(path.join(buildDir, 'projects/index.html'))
  await fs.access(path.join(buildDir, 'pagefind/pagefind.js'))
  await fs.access(path.join(buildDir, 'llms.txt'))
  await fs.access(path.join(buildDir, 'sitemap-index.xml'))
  await assert.rejects(() => fs.access(path.join(buildDir, 'docs/index.html')))
}

const SITE_URL = 'https://registry-e2e.example'

/**
 * @param {string} version
 */
export async function runNpmRegistryLabFixture(version: string) {
  const workspace = registryWorkspaceDir('npm', version)
  await resetRegistryWorkspace(workspace)

  await runCommand('npm', ['init', '-y'], { cwd: workspace })
  await runCommand('npm', ['install', `tidypress@${version}`], { cwd: workspace })

  const cliPath = path.join(workspace, 'node_modules', 'tidypress', 'bin', 'tidypress.js')
  await fs.access(cliPath)

  const siteRoot = path.join(workspace, 'site')
  await fs.mkdir(siteRoot, { recursive: true })

  const { stdout: versionOut } = await runRegistryCli(cliPath, ['--version'], siteRoot)
  assert.equal(versionOut.trim(), version)

  await runRegistryCli(
    cliPath,
    ['init', '--preset', 'lab', '--site-url', SITE_URL],
    siteRoot,
  )
  const publishRoot = await resolvePublishRootUnder(siteRoot)

  await runRegistryCli(cliPath, ['build'], siteRoot)
  const buildDir = path.join(publishRoot, 'build')
  await assertLabBuildArtifacts(buildDir)

  return { workspace, siteRoot, buildDir, cliPath }
}

/**
 * @param {string} version
 */
export async function runPnpmRegistryLabFixture(version: string) {
  const workspace = registryWorkspaceDir('pnpm', version)
  await resetRegistryWorkspace(workspace)

  await runCommand('pnpm', ['init'], { cwd: workspace })
  await runCommand('pnpm', ['add', `tidypress@${version}`], { cwd: workspace })

  const cliPath = path.join(workspace, 'node_modules', 'tidypress', 'bin', 'tidypress.js')
  await fs.access(cliPath)

  const siteRoot = path.join(workspace, 'site')
  await fs.mkdir(siteRoot, { recursive: true })

  const { stdout: versionOut } = await runRegistryCli(cliPath, ['--version'], siteRoot)
  assert.equal(versionOut.trim(), version)

  await runRegistryCli(
    cliPath,
    ['init', '--preset', 'lab', '--site-url', SITE_URL],
    siteRoot,
  )
  const publishRoot = await resolvePublishRootUnder(siteRoot)

  await runRegistryCli(cliPath, ['build'], siteRoot)
  const buildDir = path.join(publishRoot, 'build')
  await assertLabBuildArtifacts(buildDir)

  return { workspace, siteRoot, buildDir, cliPath }
}

/**
 * @param {string} version
 */
export async function runPipRegistryLabFixture(version: string) {
  const workspace = registryWorkspaceDir('pip', version)
  await resetRegistryWorkspace(workspace)

  // PyPI wrapper delegates to Node CLI via node_modules or TIDYPRESS_CLI_JS.
  await runCommand('npm', ['init', '-y'], { cwd: workspace })
  await runCommand('npm', ['install', `tidypress@${version}`], { cwd: workspace })

  const cliJs = path.join(workspace, 'node_modules', 'tidypress', 'bin', 'tidypress.js')
  await fs.access(cliJs)

  const venvDir = path.join(workspace, '.venv')
  await runCommand('python3', ['-m', 'venv', venvDir], { cwd: workspace })

  const pip = path.join(venvDir, 'bin', 'pip')
  const tidypressBin = path.join(venvDir, 'bin', 'tidypress')
  await runCommand(pip, ['install', '--upgrade', 'pip'], { cwd: workspace })
  await runCommand(pip, ['install', `tidypress==${version}`], { cwd: workspace })

  const siteRoot = path.join(workspace, 'site')
  await fs.mkdir(siteRoot, { recursive: true })

  const cliEnv = {
    TIDYPRESS_CLI_JS: cliJs,
    CI: 'true',
    TIDYPRESS_JSON_LOGS: '1',
  }

  const versionProc = await execFileAsync(tidypressBin, ['--version'], {
    cwd: siteRoot,
    env: { ...process.env, ...cliEnv },
    maxBuffer: 10 * 1024 * 1024,
  })
  assert.equal((versionProc.stdout ?? '').trim(), version)

  await execFileAsync(tidypressBin, ['init', '--preset', 'lab', '--site-url', SITE_URL], {
    cwd: siteRoot,
    env: { ...process.env, ...cliEnv },
    maxBuffer: 20 * 1024 * 1024,
  })

  await execFileAsync(tidypressBin, ['build'], {
    cwd: siteRoot,
    env: { ...process.env, ...cliEnv },
    maxBuffer: 20 * 1024 * 1024,
  })

  const publishRoot = await resolvePublishRootUnder(siteRoot)
  const buildDir = path.join(publishRoot, 'build')
  await assertLabBuildArtifacts(buildDir)

  return { workspace, siteRoot, buildDir }
}
