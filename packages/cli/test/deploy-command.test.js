import test from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'

import { DeployCommand } from '../src/commands/deploy.js'

test('DeployCommand writes deploy workflow when --with-ci is enabled', async () => {
  /** @type {Array<Record<string, unknown>>} */
  const workflowRequests = []
  /** @type {string[]} */
  const messages = []

  const command = new DeployCommand({
    buildService: {
      async build() {
        throw new Error('build should not run when withCi=true')
      },
    },
    deployService: {
      async deploy() {
        throw new Error('deploy should not run when withCi=true')
      },
    },
    io: {
      info(message) {
        messages.push(message)
      },
    },
    workflowTemplateWriter: async request => {
      workflowRequests.push(request)
      return path.join('/workspace', '.github/workflows/deploy.yml')
    },
  })

  await command.execute({ projectRoot: '/workspace', target: 'vercel', withCi: true })

  assert.deepEqual(workflowRequests, [{ projectRoot: '/workspace', target: 'vercel' }])
  assert.deepEqual(messages, ['Generated deploy workflow: /workspace/.github/workflows/deploy.yml'])
})

test('DeployCommand builds and deploys when --with-ci is disabled', async () => {
  /** @type {Array<Record<string, unknown>>} */
  const deployRequests = []
  /** @type {string[]} */
  const messages = []

  const command = new DeployCommand({
    buildService: {
      async build(request) {
        assert.deepEqual(request, { projectRoot: '/workspace' })
        return { buildDir: '/workspace/docs/build', docsDir: '/workspace/docs', cacheDir: '/tmp/cache' }
      },
    },
    deployService: {
      async deploy(request) {
        deployRequests.push(request)
      },
    },
    io: {
      info(message) {
        messages.push(message)
      },
    },
  })

  await command.execute({ projectRoot: '/workspace', target: 'netlify', withCi: false })

  assert.equal(deployRequests.length, 1)
  assert.equal(deployRequests[0].projectRoot, '/workspace')
  assert.equal(deployRequests[0].distDir, '/workspace/docs/build')
  assert.equal(deployRequests[0].target, 'netlify')
  assert.equal(typeof deployRequests[0].io, 'object')
  assert.equal(typeof /** @type {{ info?: unknown }} */ (deployRequests[0].io).info, 'function')
  assert.deepEqual(messages, ['Deploy flow completed for target: netlify'])
})
