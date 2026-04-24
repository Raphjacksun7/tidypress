import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import {
  ArtifactOnlyDeployStrategy,
  ExternalTargetDeployStrategy,
  LocalCopyDeployStrategy,
} from '../src/deployment/DeployStrategies.js'
import { DeployService } from '../src/services/DeployService.js'

test('DeployService uses artifact strategy by default', async () => {
  /** @type {string[]} */
  const messages = []
  const service = new DeployService({
    strategies: [
      new ArtifactOnlyDeployStrategy({
        io: { info: message => messages.push(message) },
      }),
    ],
  })

  await service.deploy({
    projectRoot: '/workspace',
    distDir: '/workspace/.docsmint/dist',
  })

  assert.equal(messages.length, 2)
  assert.match(messages[0], /Build artifact ready/)
})

test('DeployService copies dist with local-copy strategy', async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'docsmint-deploy-service-'))
  const distDir = path.join(tempRoot, 'dist')
  const destinationDir = path.join(tempRoot, 'published')
  await fs.mkdir(distDir, { recursive: true })
  await fs.writeFile(path.join(distDir, 'index.html'), '<html>ok</html>', 'utf8')

  const service = new DeployService({
    strategies: [new LocalCopyDeployStrategy()],
  })

  await service.deploy({
    projectRoot: tempRoot,
    distDir,
    target: './published',
  })

  const copied = await fs.readFile(path.join(destinationDir, 'index.html'), 'utf8')
  assert.equal(copied, '<html>ok</html>')
})

test('DeployService delegates external targets to external strategy', async () => {
  /** @type {string[]} */
  const messages = []
  const service = new DeployService({
    strategies: [
      new ExternalTargetDeployStrategy({
        io: { info: message => messages.push(message) },
      }),
    ],
  })

  await service.deploy({
    projectRoot: '/workspace',
    distDir: '/workspace/.docsmint/dist',
    target: 's3://docs-bucket',
  })

  assert.equal(messages.length, 3)
  assert.match(messages[1], /s3:\/\/docs-bucket/)
})
