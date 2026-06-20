import test from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'

import { Application } from '../src/application/Application.js'
import { TidyPressError } from '../src/errors/TidyPressError.js'

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

test('Application dispatches build with --no-llms-txt', async () => {
  const build = new FakeCommand()
  const app = new Application({
    version: '0.1.0',
    projectRoot: '/workspace',
    commands: { build },
    io: { info() {}, error() {} },
  })

  await app.run(['build', '--no-llms-txt'])
  assert.equal(build.calls.length, 1)
  assert.deepEqual(build.calls[0], {
    projectRoot: '/workspace',
    outputPath: undefined,
    skipLlmsTxt: true,
  })
})

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

test('Application rejects unknown build options like --sync', async () => {
  const app = new Application({
    version: '0.1.0',
    projectRoot: '/workspace',
    commands: { build: new FakeCommand() },
    io: { info() {}, error() {} },
  })

  await assert.rejects(
    async () => {
      await app.run(['build', '--sync'])
    },
    error => {
      assert.ok(error instanceof TidyPressError)
      assert.equal(error.code, 'INVALID_BUILD_OPTION')
      assert.equal(error.exitCode, 2)
      return true
    },
  )
})

test('Application rejects unknown dev options', async () => {
  const app = new Application({
    version: '0.1.0',
    projectRoot: '/workspace',
    commands: { dev: new FakeCommand() },
    io: { info() {}, error() {} },
  })

  await assert.rejects(
    async () => {
      await app.run(['dev', '--sync'])
    },
    error => {
      assert.ok(error instanceof TidyPressError)
      assert.equal(error.code, 'INVALID_DEV_OPTION')
      assert.equal(error.exitCode, 2)
      return true
    },
  )
})

test('Application rejects unexpected clean arguments', async () => {
  const app = new Application({
    version: '0.1.0',
    projectRoot: '/workspace',
    commands: { clean: new FakeCommand() },
    io: { info() {}, error() {} },
  })

  await assert.rejects(
    async () => {
      await app.run(['clean', '--sync'])
    },
    error => {
      assert.ok(error instanceof TidyPressError)
      assert.equal(error.code, 'INVALID_CLEAN_OPTION')
      assert.equal(error.exitCode, 2)
      return true
    },
  )
})

test('Application dispatches skills install with force flag', async () => {
  const skills = new FakeCommand()
  const app = new Application({
    version: '0.1.0',
    projectRoot: '/workspace',
    commands: { skills },
    io: { info() {}, error() {} },
  })

  await app.run(['skills', 'install', '--force'])
  assert.equal(skills.calls.length, 1)
  assert.deepEqual(skills.calls[0], { subcommand: 'install', force: true })
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
  assert.deepEqual(init.calls[0], {
    projectRoot: '/workspace',
    starterPreset: 'default',
    withAstro: false,
    siteUrl: undefined,
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
  assert.match(output[0], /tidypress <command>/)
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
      assert.ok(error instanceof TidyPressError)
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
      assert.ok(error instanceof TidyPressError)
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
      assert.ok(error instanceof TidyPressError)
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
      assert.ok(error instanceof TidyPressError)
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
      assert.ok(error instanceof TidyPressError)
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
      assert.ok(error instanceof TidyPressError)
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
      assert.ok(error instanceof TidyPressError)
      assert.equal(error.code, 'INVALID_DOMAIN_OPTION')
      assert.equal(error.exitCode, 2)
      return true
    },
  )
})
