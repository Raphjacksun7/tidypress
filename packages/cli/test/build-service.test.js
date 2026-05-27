import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { BuildService } from '../src/services/BuildService.js'

test('BuildService copies build output to --output destination when provided', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tidypress-build-service-'))
  const docsDir = path.join(root, 'docs')
  const buildDir = path.join(docsDir, 'build')
  const cacheDir = path.join(os.tmpdir(), 'tidypress-cache-test')
  const outputPath = path.join(root, 'artifact')
  await fs.mkdir(buildDir, { recursive: true })
  await fs.writeFile(path.join(buildDir, 'index.html'), '<html>ok</html>', 'utf8')

  /** @type {Array<{ name: string, payload: Record<string, unknown> }>} */
  const calls = []
  const configLoader = {
    async resolveDocsDirectory(payload) {
      calls.push({ name: 'resolveDocsDirectory', payload })
      return docsDir
    },
    async ensureConfigFile(payload) {
      calls.push({ name: 'ensureConfigFile', payload })
    },
    async validateNavigation(payload) {
      calls.push({ name: 'validateNavigation', payload })
    },
    async loadConfig(payload) {
      calls.push({ name: 'loadConfig', payload })
      return { name: 'site' }
    },
  }
  const session = {
    docsDir,
    engineRoot: '/engine',
    buildDir,
    cacheDir,
    publicDir: path.join(cacheDir, 'public'),
    manifestPath: path.join(cacheDir, 'codegen', 'tidypress-plugins.mjs'),
  }
  const engineManager = {
    async prepare(payload) {
      calls.push({ name: 'prepare', payload })
      return session
    },
    async runBuild(payload) {
      calls.push({ name: 'runBuild', payload })
    },
    getBuildDirectory(payload) {
      calls.push({ name: 'getBuildDirectory', payload })
      return buildDir
    },
  }

  const service = new BuildService({ configLoader, engineManager })
  const result = await service.build({ projectRoot: root, outputPath })

  assert.equal(result.docsDir, docsDir)
  assert.equal(result.buildDir, buildDir)
  assert.equal(result.cacheDir, cacheDir)
  assert.deepEqual(calls.map(call => call.name), [
    'resolveDocsDirectory',
    'ensureConfigFile',
    'validateNavigation',
    'prepare',
    'runBuild',
    'getBuildDirectory',
    'loadConfig',
  ])

  const copied = await fs.readFile(path.join(outputPath, 'index.html'), 'utf8')
  assert.equal(copied, '<html>ok</html>')
})
