import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { createProviderStrategies, createProviderStrategy } from '../src/deployment/ProviderDeployStrategies.js'
import { TidyPressError } from '../src/errors/TidyPressError.js'

const CLOUD_PROVIDER_CASES = [
  {
    provider: 'vercel',
    expectedCommand: 'vercel',
    expectedArgs: ['deploy', '--prod', '/workspace/site/build'],
  },
  {
    provider: 'netlify',
    expectedCommand: 'netlify',
    expectedArgs: ['deploy', '--dir', '/workspace/site/build', '--prod'],
  },
  {
    provider: 'surge',
    expectedCommand: 'surge',
    expectedArgs: ['/workspace/site/build'],
  },
  {
    provider: 'github-pages',
    expectedCommand: 'npx',
    expectedArgs: ['gh-pages', '-d', '/workspace/site/build'],
  },
  {
    provider: 'cloudflare',
    expectedCommand: 'wrangler',
    expectedArgs: ['pages', 'deploy', '/workspace/site/build'],
  },
]

for (const scenario of CLOUD_PROVIDER_CASES) {
  test(`Provider strategy runs deploy command for ${scenario.provider}`, async () => {
    /** @type {Array<{ command: string, args: string[] }>} */
    const commands = []
    /** @type {string[]} */
    const messages = []

    const strategy = createProviderStrategy({
      provider: scenario.provider,
      io: { info: message => messages.push(message) },
      runCommand: async (command, args) => {
        commands.push({ command, args })
      },
    })

    const request = {
      projectRoot: '/workspace',
      distDir: '/workspace/site/build',
      target: scenario.provider,
    }

    assert.equal(strategy.supports(request), true)
    await strategy.execute(request)

    assert.deepEqual(commands, [
      {
        command: scenario.expectedCommand,
        args: scenario.expectedArgs,
      },
    ])
    assert.equal(messages.length, 1)
  })
}

test('createProviderStrategies includes all cloud provider strategy ids', () => {
  const strategies = createProviderStrategies()
  const ids = new Set(strategies.map(strategy => strategy.id))

  assert.equal(ids.has('provider:vercel'), true)
  assert.equal(ids.has('provider:netlify'), true)
  assert.equal(ids.has('provider:surge'), true)
  assert.equal(ids.has('provider:github-pages'), true)
  assert.equal(ids.has('provider:cloudflare'), true)
})

test('docker provider generates Docker deployment files in dist', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tidypress-docker-provider-'))
  const distDir = path.join(root, 'dist')
  await fs.mkdir(distDir, { recursive: true })

  const strategy = createProviderStrategy({ provider: 'docker' })
  await strategy.execute({ projectRoot: root, distDir, target: 'docker' })

  const dockerfile = await fs.readFile(path.join(distDir, 'Dockerfile'), 'utf8')
  const compose = await fs.readFile(path.join(distDir, 'docker-compose.yml'), 'utf8')
  assert.match(dockerfile, /FROM nginx:alpine/)
  assert.match(compose, /tidypress:/)
})

test('static provider logs readiness without shell commands', async () => {
  /** @type {string[]} */
  const messages = []
  /** @type {Array<{ command: string, args: string[] }>} */
  const commands = []

  const strategy = createProviderStrategy({
    provider: 'static',
    io: {
      info(message) {
        messages.push(message)
      },
    },
    async runCommand(command, args) {
      commands.push({ command, args })
    },
  })

  await strategy.execute({
    projectRoot: '/workspace',
    distDir: '/workspace/site/build',
    target: 'static',
  })

  assert.equal(commands.length, 0)
  assert.deepEqual(messages, ['Static output ready at /workspace/docs/build'])
})

test('s3 provider requires a target when none is supplied', async () => {
  const strategy = createProviderStrategy({ provider: 's3' })

  await assert.rejects(
    async () => {
      await strategy.execute({
        projectRoot: '/workspace',
        distDir: '/workspace/site/build',
        target: 's3',
      })
    },
    error => {
      assert.ok(error instanceof TidyPressError)
      assert.equal(error.code, 'DEPLOY_PROVIDER_TARGET_REQUIRED')
      return true
    },
  )
})

test('s3 provider executes aws sync command for URI targets', async () => {
  /** @type {Array<{ command: string, args: string[] }>} */
  const commands = []
  const strategy = createProviderStrategy({
    provider: 's3',
    async runCommand(command, args) {
      commands.push({ command, args })
    },
  })

  await strategy.execute({
    projectRoot: '/workspace',
    distDir: '/workspace/site/build',
    target: 's3://bucket/docs',
  })

  assert.deepEqual(commands, [
    {
      command: 'aws',
      args: ['s3', 'sync', '/workspace/docs/build/', 's3://bucket/docs', '--delete'],
    },
  ])
})

test('ssh provider executes rsync command for scp targets', async () => {
  /** @type {Array<{ command: string, args: string[] }>} */
  const commands = []
  const strategy = createProviderStrategy({
    provider: 'ssh',
    async runCommand(command, args) {
      commands.push({ command, args })
    },
  })

  await strategy.execute({
    projectRoot: '/workspace',
    distDir: '/workspace/site/build',
    target: 'deploy@example.com:/var/www/site',
  })

  assert.deepEqual(commands, [
    {
      command: 'rsync',
      args: ['-az', '--delete', '/workspace/docs/build/', 'deploy@example.com:/var/www/site'],
    },
  ])
})
