import test from 'node:test'
import assert from 'node:assert/strict'
import { access, mkdir, mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { TidyPressError } from '../src/errors/TidyPressError.js'
import { handleCliError, runCli, runCliMain } from '../src/runCli.js'

test('handleCliError returns custom TidyPressError exit code', () => {
  /** @type {string[]} */
  const errors = []
  const code = handleCliError(
    new TidyPressError('Invalid config', 'CONFIG_INVALID', 'Fix site/tidypress.config.ts', { exitCode: 2 }),
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
  assert.match(errors[0], /Hint: Fix site\/tidypress.config.ts/)
})

test('handleCliError prints TidyPressError stack in verbose mode', () => {
  /** @type {string[]} */
  const errors = []
  const code = handleCliError(new TidyPressError('Verbose failure'), {
    io: {
      error(message) {
        errors.push(message)
      },
    },
    verboseErrors: true,
  })

  assert.equal(code, 1)
  assert.equal(errors.length, 2)
  assert.match(errors[1], /TidyPressError: Verbose failure/)
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

test('runCli plumbs --verbose flag to TidyPressError stack output', async () => {
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
  assert.match(errors[1], /TidyPressError: Unknown command: does-not-exist/)
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

test('runCli --install-skills alone installs skills without default dev command', async () => {
  const tempHome = await mkdtemp(path.join(os.tmpdir(), 'tidypress-runcli-skills-'))
  const originalHome = process.env.HOME
  const ciEnv = ['CI', 'CONTINUOUS_INTEGRATION', 'GITHUB_ACTIONS', 'GITLAB_CI'] as const
  const savedCi: Record<string, string | undefined> = {}
  for (const key of ciEnv) {
    savedCi[key] = process.env[key]
    delete process.env[key]
  }
  process.env.HOME = tempHome
  const io = { info() {}, error() {} }

  try {
    await mkdir(path.join(tempHome, '.cursor'), { recursive: true })
    const code = await runCli(['--install-skills'], { io })
    assert.equal(code, 0)
    await access(path.join(tempHome, '.cursor', 'skills', 'tidypress', 'SKILL.md'))
  } finally {
    if (originalHome === undefined) {
      delete process.env.HOME
    } else {
      process.env.HOME = originalHome
    }
    for (const key of ciEnv) {
      if (savedCi[key] === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = savedCi[key]
      }
    }
    await rm(tempHome, { recursive: true, force: true })
  }
})
