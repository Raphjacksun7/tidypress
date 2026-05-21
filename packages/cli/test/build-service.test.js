import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { BuildService } from '../src/services/BuildService.js'

test('BuildService copies dist to --output destination when provided', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'docsmint-build-service-'))
  const docsDir = path.join(root, 'docs')
  const distDir = path.join(docsDir, '.docsmint', 'dist')
  const outputPath = path.join(root, 'artifact')
  await fs.mkdir(distDir, { recursive: true })
  await fs.writeFile(path.join(distDir, 'index.html'), '<html>ok</html>', 'utf8')

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
  const engineManager = {
    async prepare(payload) {
      calls.push({ name: 'prepare', payload })
      return path.join(docsDir, '.docsmint')
    },
    async runBuild(payload) {
      calls.push({ name: 'runBuild', payload })
    },
    getDistDirectory(payload) {
      calls.push({ name: 'getDistDirectory', payload })
      return distDir
    },
  }

  const service = new BuildService({ configLoader, engineManager })
  const result = await service.build({ projectRoot: root, outputPath })

  assert.equal(result.docsDir, docsDir)
  assert.equal(result.distDir, distDir)
  assert.equal(result.workdir, path.join(docsDir, '.docsmint'))
  assert.deepEqual(calls.map(call => call.name), [
    'resolveDocsDirectory',
    'ensureConfigFile',
    'validateNavigation',
    'prepare',
    'runBuild',
    'getDistDirectory',
    'loadConfig',
  ])

  const copied = await fs.readFile(path.join(outputPath, 'index.html'), 'utf8')
  assert.equal(copied, '<html>ok</html>')
})
