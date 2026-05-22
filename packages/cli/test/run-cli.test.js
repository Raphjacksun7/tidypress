import test from 'node:test'
import assert from 'node:assert/strict'

import { DocsMintError } from '../src/errors/DocsMintError.js'
import { handleCliError, runCli, runCliMain } from '../src/runCli.js'

test('handleCliError returns custom DocsMintError exit code', () => {
  /** @type {string[]} */
  const errors = []
  const code = handleCliError(
    new DocsMintError('Invalid config', 'CONFIG_INVALID', 'Fix docs/docsmint.config.ts', { exitCode: 2 }),
    {
      io: {
        error(message) {
          errors.push(message)
        },
      },
      verboseErrors: false,
    },
  )

  assert.equal(code, 2)
  assert.equal(errors.length, 1)
  assert.match(errors[0], /Invalid config/)
  assert.match(errors[0], /Hint: Fix docs\/docsmint.config.ts/)
})

test('handleCliError prints DocsMintError stack in verbose mode', () => {
  /** @type {string[]} */
  const errors = []
  const code = handleCliError(new DocsMintError('Verbose failure'), {
    io: {
      error(message) {
        errors.push(message)
      },
    },
    verboseErrors: true,
  })

  assert.equal(code, 1)
  assert.equal(errors.length, 2)
  assert.match(errors[1], /DocsMintError: Verbose failure/)
})

test('handleCliError reports unexpected error with stack', () => {
  /** @type {string[]} */
  const errors = []
  const code = handleCliError(new Error('boom'), {
    io: {
      error(message) {
        errors.push(message)
      },
    },
    verboseErrors: false,
  })

  assert.equal(code, 1)
  assert.equal(errors.length, 2)
  assert.equal(errors[0], 'Unexpected error: boom')
  assert.match(errors[1], /Error: boom/)
})

test('runCli returns usage exit code for unknown command', async () => {
  /** @type {string[]} */
  const errors = []
  const code = await runCli(['does-not-exist'], {
    io: {
      info() {},
      error(message) {
        errors.push(message)
      },
    },
  })

  assert.equal(code, 2)
  assert.equal(errors.length, 1)
  assert.match(errors[0], /Unknown command: does-not-exist/)
})

test('runCli plumbs --verbose flag to DocsMintError stack output', async () => {
  /** @type {string[]} */
  const errors = []
  const code = await runCli(['--verbose', 'does-not-exist'], {
    io: {
      info() {},
      error(message) {
        errors.push(message)
      },
    },
  })

  assert.equal(code, 2)
  assert.equal(errors.length, 2)
  assert.match(errors[0], /Unknown command: does-not-exist/)
  assert.match(errors[1], /DocsMintError: Unknown command: does-not-exist/)
})

test('runCliMain sets process exitCode from run result', async () => {
  const previous = process.exitCode
  process.exitCode = undefined
  try {
    await runCliMain(['does-not-exist'])
    assert.equal(process.exitCode, 2)
  } finally {
    process.exitCode = previous
  }
})
