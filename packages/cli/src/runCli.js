import process from 'node:process'
import { createRequire } from 'node:module'

import { createApplication } from './bootstrap/createApplication.js'
import { TidyPressError } from './errors/TidyPressError.js'

const require = createRequire(import.meta.url)
const { version } = require('../package.json')

/**
 * @param {string[]} argv
 * @returns {{ argv: string[], verboseErrors: boolean }}
 */
function parseCliFlags(argv) {
  /** @type {string[]} */
  const filtered = []
  let verboseErrors = false
  for (const arg of argv) {
    if (arg === '--verbose') {
      verboseErrors = true
      continue
    }
    filtered.push(arg)
  }
  return {
    argv: filtered,
    verboseErrors,
  }
}

/**
 * @param {unknown} thrown
 * @returns {Error}
 */
function normalizeThrown(thrown) {
  if (thrown instanceof Error) {
    return thrown
  }
  return new Error(String(thrown))
}

/**
 * @param {unknown} error
 * @param {{ io: { error: (message: string) => void }, verboseErrors: boolean }} options
 * @returns {number}
 */
export function handleCliError(error, { io, verboseErrors }) {
  if (error instanceof TidyPressError) {
    io.error(error.formatUserMessage())
    if (verboseErrors && error.stack) {
      io.error(error.stack)
    }
    return error.exitCode
  }

  const unknown = normalizeThrown(error)
  io.error(`Unexpected error: ${unknown.message}`)
  if (unknown.stack) {
    io.error(unknown.stack)
  }
  return 1
}

/**
 * @param {string[]} argv
 * @param {{ projectRoot?: string, io?: { info: (message: string) => void, error: (message: string) => void } }} [options]
 * @returns {Promise<number>}
 */
export async function runCli(argv, { projectRoot = process.cwd(), io = console } = {}) {
  const parsed = parseCliFlags(argv)
  const app = createApplication({ projectRoot, version, io })
  try {
    await app.run(parsed.argv)
    return 0
  } catch (error) {
    return handleCliError(error, { io, verboseErrors: parsed.verboseErrors })
  }
}

/**
 * @param {string[]} argv
 * @returns {Promise<void>}
 */
export async function runCliMain(argv) {
  const code = await runCli(argv)
  process.exitCode = code
}
