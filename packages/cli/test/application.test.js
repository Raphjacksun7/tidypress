import test from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'

import { Application } from '../src/application/Application.js'

class FakeCommand {
  constructor() {
    /** @type {Array<Record<string, unknown>>} */
    this.calls = []
  }

  /**
   * @param {Record<string, unknown>} request
   */
  async execute(request) {
    this.calls.push(request)
  }
}

test('Application dispatches dev command with parsed port', async () => {
  const dev = new FakeCommand()
  const app = new Application({
    version: '0.1.0',
    projectRoot: '/workspace',
    commands: { dev },
    io: { info() {}, error() {} },
  })

  await app.run(['dev', '--port', '4567'])
  assert.equal(dev.calls.length, 1)
  assert.deepEqual(dev.calls[0], { projectRoot: '/workspace', port: 4567 })
})

test('Application dispatches context command with resolved output path', async () => {
  const context = new FakeCommand()
  const app = new Application({
    version: '0.1.0',
    projectRoot: '/workspace',
    commands: { context },
    io: { info() {}, error() {} },
  })

  await app.run(['context', 'tmp/context.md'])
  assert.equal(context.calls.length, 1)
  assert.deepEqual(context.calls[0], {
    projectRoot: '/workspace',
    outputPath: path.resolve('/workspace', 'tmp/context.md'),
  })
})

test('Application emits help text for --help', async () => {
  /** @type {string[]} */
  const output = []
  const app = new Application({
    version: '0.1.0',
    projectRoot: '/workspace',
    commands: {},
    io: {
      info(message) {
        output.push(message)
      },
      error() {},
    },
  })

  await app.run(['--help'])
  assert.equal(output.length, 1)
  assert.match(output[0], /docsmint <command>/)
})

test('Application rejects invalid ports', async () => {
  const app = new Application({
    version: '0.1.0',
    projectRoot: '/workspace',
    commands: { dev: new FakeCommand() },
    io: { info() {}, error() {} },
  })

  await assert.rejects(async () => {
    await app.run(['dev', '--port', 'NaN'])
  }, /Invalid --port value/)
})
