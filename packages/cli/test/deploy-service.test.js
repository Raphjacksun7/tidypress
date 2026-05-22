import test from 'node:test'
import assert from 'node:assert/strict'
import { ArtifactOnlyDeployStrategy } from '../src/deployment/DeployStrategies.js'
import { DocsMintError } from '../src/errors/DocsMintError.js'
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

test('DeployService sets usage exit code when target is unsupported', async () => {
  const service = new DeployService({ strategies: [] })

  await assert.rejects(
    async () => {
      await service.deploy({
        projectRoot: '/workspace',
        distDir: '/workspace/.docsmint/dist',
        target: 'unsupported-target',
      })
    },
    error => {
      assert.ok(error instanceof DocsMintError)
      assert.equal(error.code, 'DEPLOY_NO_STRATEGY')
      assert.equal(error.exitCode, 2)
      return true
    },
  )
})
