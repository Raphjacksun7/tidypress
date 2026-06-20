import process from 'node:process'
import { createRequire } from 'node:module'

import { maybeInstallTidyPressSkillsGlobally } from './agents-skills/install.js'
import { createApplication } from './application/createApplication.js'
import { TidyPressError } from './errors/TidyPressError.js'

const require = createRequire(import.meta.url)
const { version } = require('../package.json')

/**
 * @param {string[]} argv
 * @returns {{ argv: string[], verboseErrors: boolean, installSkills: boolean }}
 */
function parseCliFlags(argv) {
  /** @type {string[]} */
  const filtered = []
  let verboseErrors = false
  let installSkills = false
  for (const arg of argv) {
    if (arg === '--verbose') {
      verboseErrors = true
      continue
    }
    if (arg === '--install-skills' || arg === '--x-install-skills') {
      installSkills = true
      continue
    }
    filtered.push(arg)
  }
  return {
    argv: filtered,
    verboseErrors,
    installSkills,
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
 * @param {{ status?: string, reason?: string }} result
 * @param {{ io: { info: (message: string) => void }, force: boolean }} options
 */
function reportSkillsOutcome(result, { io, force }) {
  if (!result || result.status !== 'skipped') {
    return
  }
  const next = '`tidypress skills install --force`'
  if (result.reason === 'ci') {
    io.info(`Skipped TidyPress skills install: running in CI. Run ${next} locally.`)
    return
  }
  if (result.reason === 'already_prompted') {
    io.info(`Skipped TidyPress skills install: this machine was already prompted. Re-run ${next} to reinstall.`)
    return
  }
  if (result.reason === 'no_agents') {
    io.info(
      'Skipped TidyPress skills install: no supported agents detected (~/.cursor, ~/.claude, ~/.codex). Create one of those directories or run on a machine with the agent installed.',
    )
    return
  }
  if (result.reason === 'non_interactive') {
    io.info(`Skipped TidyPress skills install: non-interactive terminal. Run ${next} in an interactive shell.`)
    return
  }
  if (result.reason === 'declined') {
    io.info(`Skipped TidyPress skills install: user declined prompt. Re-run ${next} when ready.`)
    return
  }
  if (force) {
    io.info(`Skipped TidyPress skills install (${result.reason ?? 'unknown reason'}).`)
  }
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
    if (parsed.installSkills) {
      const result = await maybeInstallTidyPressSkillsGlobally({ force: true, io })
      reportSkillsOutcome(result, { io, force: true })
      if (parsed.argv.length === 0) {
        return 0
      }
    } else {
      // Run skills bootstrap before command execution so `tidypress dev` can still prompt.
      const result = await maybeInstallTidyPressSkillsGlobally({ force: false, io })
      reportSkillsOutcome(result, { io, force: false })
    }

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
