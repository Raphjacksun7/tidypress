import test from 'node:test'
import assert from 'node:assert/strict'

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

test('Application defaults to dev command when no args are provided', async () => {
  const dev = new FakeCommand()
  const app = new Application({
    version: '0.1.0',
    projectRoot: '/workspace',
    commands: { dev },
    io: { info() {}, error() {} },
  })

  await app.run([])
  assert.equal(dev.calls.length, 1)
  assert.deepEqual(dev.calls[0], { projectRoot: '/workspace', port: 4321 })
})

test('Application emits version for --version flag', async () => {
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

  await app.run(['--version'])
  assert.deepEqual(output, ['0.1.0'])
})

test('Application parses deploy target argument', async () => {
  const deploy = new FakeCommand()
  const app = new Application({
    version: '0.1.0',
    projectRoot: '/workspace',
    commands: { deploy },
    io: { info() {}, error() {} },
  })

  await app.run(['deploy', 'netlify'])
  assert.equal(deploy.calls.length, 1)
  assert.deepEqual(deploy.calls[0], {
    projectRoot: '/workspace',
    target: 'netlify',
    withCi: false,
  })
})

test('Application parses migrate-sections command', async () => {
  const migrateSections = new FakeCommand()
  const app = new Application({
    version: '0.1.0',
    projectRoot: '/workspace',
    commands: { 'migrate-sections': migrateSections },
    io: { info() {}, error() {} },
  })

  await app.run(['migrate-sections'])
  assert.equal(migrateSections.calls.length, 1)
  assert.deepEqual(migrateSections.calls[0], {
    projectRoot: '/workspace',
  })
})

test('Application supports deploy with no explicit target', async () => {
  const deploy = new FakeCommand()
  const app = new Application({
    version: '0.1.0',
    projectRoot: '/workspace',
    commands: { deploy },
    io: { info() {}, error() {} },
  })

  await app.run(['deploy'])
  assert.equal(deploy.calls.length, 1)
  assert.deepEqual(deploy.calls[0], {
    projectRoot: '/workspace',
    target: undefined,
    withCi: false,
  })
})

test('Application parses deploy --with-ci option', async () => {
  const deploy = new FakeCommand()
  const app = new Application({
    version: '0.1.0',
    projectRoot: '/workspace',
    commands: { deploy },
    io: { info() {}, error() {} },
  })

  await app.run(['deploy', 'vercel', '--with-ci'])
  assert.equal(deploy.calls.length, 1)
  assert.deepEqual(deploy.calls[0], {
    projectRoot: '/workspace',
    target: 'vercel',
    withCi: true,
  })
})

test('Application parses domain setup command arguments', async () => {
  const domain = new FakeCommand()
  const app = new Application({
    version: '0.1.0',
    projectRoot: '/workspace',
    commands: { domain },
    io: { info() {}, error() {} },
  })

  await app.run(['domain', 'setup', 'docs.example.com', '--platform', 'vercel'])
  assert.equal(domain.calls.length, 1)
  assert.deepEqual(domain.calls[0], {
    projectRoot: '/workspace',
    action: 'setup',
    domain: 'docs.example.com',
    platform: 'vercel',
  })
})

test('Application accepts domain --platform=value syntax', async () => {
  const domain = new FakeCommand()
  const app = new Application({
    version: '0.1.0',
    projectRoot: '/workspace',
    commands: { domain },
    io: { info() {}, error() {} },
  })

  await app.run(['domain', 'setup', 'docs.example.com', '--platform=netlify'])
  assert.equal(domain.calls.length, 1)
  assert.deepEqual(domain.calls[0], {
    projectRoot: '/workspace',
    action: 'setup',
    domain: 'docs.example.com',
    platform: 'netlify',
  })
})

test('Application allows domain setup without explicit domain argument', async () => {
  const domain = new FakeCommand()
  const app = new Application({
    version: '0.1.0',
    projectRoot: '/workspace',
    commands: { domain },
    io: { info() {}, error() {} },
  })

  await app.run(['domain', 'setup', '--platform', 'vercel'])
  assert.equal(domain.calls.length, 1)
  assert.deepEqual(domain.calls[0], {
    projectRoot: '/workspace',
    action: 'setup',
    domain: undefined,
    platform: 'vercel',
  })
})

test('Application rejects unknown deploy options', async () => {
  const deploy = new FakeCommand()
  const app = new Application({
    version: '0.1.0',
    projectRoot: '/workspace',
    commands: { deploy },
    io: { info() {}, error() {} },
  })

  await assert.rejects(async () => {
    await app.run(['deploy', '--bad-flag'])
  }, /Unknown deploy option/)
})

test('Application rejects --output flag without a value', async () => {
  const build = new FakeCommand()
  const app = new Application({
    version: '0.1.0',
    projectRoot: '/workspace',
    commands: { build },
    io: { info() {}, error() {} },
  })

  await assert.rejects(async () => {
    await app.run(['build', '--output'])
  }, /Missing value for --output/)
})

test('Application forwards resolved build --output directory to build command', async () => {
  const build = new FakeCommand()
  const app = new Application({
    version: '0.1.0',
    projectRoot: '/workspace',
    commands: { build },
    io: { info() {}, error() {} },
  })

  await app.run(['build', '--output', './artifacts/site'])
  assert.equal(build.calls.length, 1)
  assert.deepEqual(build.calls[0], {
    projectRoot: '/workspace',
    outputPath: '/workspace/artifacts/site',
    skipLlmsTxt: false,
  })
})

test('Application sends preview port when provided via short flag', async () => {
  const preview = new FakeCommand()
  const app = new Application({
    version: '0.1.0',
    projectRoot: '/workspace',
    commands: { preview },
    io: { info() {}, error() {} },
  })

  await app.run(['preview', '-p', '9000'])
  assert.equal(preview.calls.length, 1)
  assert.deepEqual(preview.calls[0], {
    projectRoot: '/workspace',
    port: 9000,
  })
})

test('Application parses add-version command arguments', async () => {
  const addVersion = new FakeCommand()
  const app = new Application({
    version: '0.1.0',
    projectRoot: '/workspace',
    commands: { 'add-version': addVersion },
    io: { info() {}, error() {} },
  })

  await app.run(['add-version', '2.1', '--set-latest'])
  assert.equal(addVersion.calls.length, 1)
  assert.deepEqual(addVersion.calls[0], {
    projectRoot: '/workspace',
    versionLabel: '2.1',
    setLatest: true,
  })
})

test('Application parses import command arguments', async () => {
  const importCommand = new FakeCommand()
  const app = new Application({
    version: '0.1.0',
    projectRoot: '/workspace',
    commands: { import: importCommand },
    io: { info() {}, error() {} },
  })

  await app.run(['import', 'medium', '--url', 'https://medium.com/@author/post', '--scheduled', '2026-06-01T09:00:00Z'])
  assert.equal(importCommand.calls.length, 1)
  assert.deepEqual(importCommand.calls[0], {
    projectRoot: '/workspace',
    provider: 'medium',
    source: 'https://medium.com/@author/post',
    scheduled: '2026-06-01T09:00:00Z',
  })
})

test('Application rejects import requests missing provider source option', async () => {
  const importCommand = new FakeCommand()
  const app = new Application({
    version: '0.1.0',
    projectRoot: '/workspace',
    commands: { import: importCommand },
    io: { info() {}, error() {} },
  })

  await assert.rejects(async () => {
    await app.run(['import', 'ghost'])
  }, /Missing required --export/)
})

test('Application parses editor experimental flag', async () => {
  const editor = new FakeCommand()
  const app = new Application({
    version: '0.1.0',
    projectRoot: '/workspace',
    commands: { editor },
    io: { info() {}, error() {} },
  })

  await app.run(['editor', '--enable-experimental-editor'])
  assert.equal(editor.calls.length, 1)
  assert.deepEqual(editor.calls[0], {
    projectRoot: '/workspace',
    enableExperimentalEditor: true,
  })
})

test('Application parses export command scaffold args', async () => {
  const exportCommand = new FakeCommand()
  const app = new Application({
    version: '0.1.0',
    projectRoot: '/workspace',
    commands: { export: exportCommand },
    io: { info() {}, error() {} },
  })

  await app.run(['export', 'pdf', 'posts/my-post.md', '--enable-experimental-export'])
  assert.equal(exportCommand.calls.length, 1)
  assert.deepEqual(exportCommand.calls[0], {
    projectRoot: '/workspace',
    enableExperimentalExport: true,
    format: 'pdf',
    source: 'posts/my-post.md',
  })
})

test('Application rejects unknown export format', async () => {
  const exportCommand = new FakeCommand()
  const app = new Application({
    version: '0.1.0',
    projectRoot: '/workspace',
    commands: { export: exportCommand },
    io: { info() {}, error() {} },
  })

  await assert.rejects(async () => {
    await app.run(['export', 'docx', '--enable-experimental-export'])
  }, /Unknown export format/)
})

test('Application parses ai command scaffold args', async () => {
  const ai = new FakeCommand()
  const app = new Application({
    version: '0.1.0',
    projectRoot: '/workspace',
    commands: { ai },
    io: { info() {}, error() {} },
  })

  await app.run(['ai', 'suggest', 'posts/draft.md', '--enable-experimental-ai'])
  assert.equal(ai.calls.length, 1)
  assert.deepEqual(ai.calls[0], {
    projectRoot: '/workspace',
    enableExperimentalAi: true,
    action: 'suggest',
    args: ['posts/draft.md'],
  })
})
