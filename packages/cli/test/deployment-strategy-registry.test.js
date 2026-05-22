import test from 'node:test'
import assert from 'node:assert/strict'

import { DeploymentStrategyRegistry } from '../src/deployment/DeploymentStrategyRegistry.js'
import { DocsMintError } from '../src/errors/DocsMintError.js'

test('DeploymentStrategyRegistry resolves the first matching strategy', () => {
  const registry = new DeploymentStrategyRegistry({
    strategies: [
      {
        id: 'artifact-only',
        supports: request => !request.target,
        async execute() {},
      },
      {
        id: 'provider:vercel',
        supports: request => request.target === 'vercel',
        async execute() {},
      },
    ],
  })

  const strategy = registry.resolve({
    projectRoot: '/workspace',
    distDir: '/workspace/dist',
    target: 'vercel',
  })

  assert.ok(strategy)
  assert.equal(strategy?.id, 'provider:vercel')
})

test('DeploymentStrategyRegistry rejects duplicate strategy ids', () => {
  assert.throws(
    () => {
      new DeploymentStrategyRegistry({
        strategies: [
          {
            id: 'provider:vercel',
            supports: () => true,
            async execute() {},
          },
          {
            id: 'provider:vercel',
            supports: () => false,
            async execute() {},
          },
        ],
      })
    },
    error => {
      assert.ok(error instanceof DocsMintError)
      assert.equal(error.code, 'DEPLOY_STRATEGY_DUPLICATE')
      return true
    },
  )
})

test('DeploymentStrategyRegistry validates strategy plugin shape', () => {
  const registry = new DeploymentStrategyRegistry()

  assert.throws(
    () => {
      registry.register(
        /** @type {any} */ ({
          id: '',
          supports: () => true,
          async execute() {},
        }),
      )
    },
    error => {
      assert.ok(error instanceof DocsMintError)
      assert.equal(error.code, 'DEPLOY_STRATEGY_INVALID')
      return true
    },
  )
})
