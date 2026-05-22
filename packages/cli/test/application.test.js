import test from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'

import { Application } from '../src/application/Application.js'
import { DocsMintError } from '../src/errors/DocsMintError.js'

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

test('Application dispatches init command with preset option', async () => {
  const init = new FakeCommand()
  const app = new Application({
    version: '0.1.0',
    projectRoot: '/workspace',
    commands: { init },
    io: { info() {}, error() {} },
  })

  await app.run(['init', '--preset', 'default'])
  assert.equal(init.calls.length, 1)
  assert.deepEqual(init.calls[0], { projectRoot: '/workspace', starterPreset: 'default' })
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

  await assert.rejects(
    async () => {
      await app.run(['dev', '--port', 'NaN'])
    },
    error => {
      assert.ok(error instanceof DocsMintError)
      assert.equal(error.code, 'INVALID_PORT')
      assert.equal(error.exitCode, 2)
      return true
    },
  )
})

test('Application sets usage exit code for unknown commands', async () => {
  const app = new Application({
    version: '0.1.0',
    projectRoot: '/workspace',
    commands: {},
    io: { info() {}, error() {} },
  })

  await assert.rejects(
    async () => {
      await app.run(['does-not-exist'])
    },
    error => {
      assert.ok(error instanceof DocsMintError)
      assert.equal(error.code, 'UNKNOWN_COMMAND')
      assert.equal(error.exitCode, 2)
      return true
    },
  )
})

test('Application sets usage exit code for missing build output value', async () => {
  const app = new Application({
    version: '0.1.0',
    projectRoot: '/workspace',
    commands: { build: new FakeCommand() },
    io: { info() {}, error() {} },
  })

  await assert.rejects(
    async () => {
      await app.run(['build', '--output'])
    },
    error => {
      assert.ok(error instanceof DocsMintError)
      assert.equal(error.code, 'INVALID_OUTPUT')
      assert.equal(error.exitCode, 2)
      return true
    },
  )
})

test('Application sets usage exit code for unknown init options', async () => {
  const app = new Application({
    version: '0.1.0',
    projectRoot: '/workspace',
    commands: { init: new FakeCommand() },
    io: { info() {}, error() {} },
  })

  await assert.rejects(
    async () => {
      await app.run(['init', '--unknown'])
    },
    error => {
      assert.ok(error instanceof DocsMintError)
      assert.equal(error.code, 'INVALID_INIT_OPTION')
      assert.equal(error.exitCode, 2)
      return true
    },
  )
})

test('Application sets usage exit code for migrate-sections options', async () => {
  const app = new Application({
    version: '0.1.0',
    projectRoot: '/workspace',
    commands: { 'migrate-sections': new FakeCommand() },
    io: { info() {}, error() {} },
  })

  await assert.rejects(
    async () => {
      await app.run(['migrate-sections', '--apply'])
    },
    error => {
      assert.ok(error instanceof DocsMintError)
      assert.equal(error.code, 'INVALID_MIGRATE_SECTIONS_OPTION')
      assert.equal(error.exitCode, 2)
      return true
    },
  )
})

test('Application sets usage exit code for missing add-version label', async () => {
  const app = new Application({
    version: '0.1.0',
    projectRoot: '/workspace',
    commands: { 'add-version': new FakeCommand() },
    io: { info() {}, error() {} },
  })

  await assert.rejects(
    async () => {
      await app.run(['add-version'])
    },
    error => {
      assert.ok(error instanceof DocsMintError)
      assert.equal(error.code, 'INVALID_ADD_VERSION_OPTION')
      assert.equal(error.exitCode, 2)
      return true
    },
  )
})

test('Application sets usage exit code for missing domain --platform value', async () => {
  const app = new Application({
    version: '0.1.0',
    projectRoot: '/workspace',
    commands: { domain: new FakeCommand() },
    io: { info() {}, error() {} },
  })

  await assert.rejects(
    async () => {
      await app.run(['domain', 'setup', 'docs.example.com'])
    },
    error => {
      assert.ok(error instanceof DocsMintError)
      assert.equal(error.code, 'INVALID_DOMAIN_OPTION')
      assert.equal(error.exitCode, 2)
      return true
    },
  )
})
