import path from 'node:path'

const HELP_TEXT = `docsmint <command> [options]

Commands:
  init       Scaffold docs/ in current directory
  dev        Start dev server
  build      Build production site
  preview    Preview production build
  clean      Remove docs/.docsmint workdir
  deploy     Build host-agnostic deploy artifact
  context    Emit an LLM-friendly docs snapshot
`

/**
 * @typedef {{ info: (message: string) => void, error: (message: string) => void }} ApplicationIO
 */

/**
 * @typedef {{ execute: (request: Record<string, unknown>) => Promise<void> }} CommandHandler
 */

/**
 * Application orchestrates CLI argument parsing and command dispatch.
 */
export class Application {
  /**
   * @param {{
   *   version: string
   *   projectRoot: string
   *   commands: Partial<Record<'init' | 'dev' | 'build' | 'preview' | 'clean' | 'deploy' | 'context', CommandHandler>>
   *   io: ApplicationIO
   * }} options
   */
  constructor({ version, projectRoot, commands, io }) {
    this.version = version
    this.projectRoot = projectRoot
    this.commands = commands
    this.io = io
  }

  /**
   * @param {string[]} argv
   * @returns {Promise<void>}
   */
  async run(argv) {
    const [command = 'dev', ...rest] = argv

    if (command === '--help' || command === '-h' || command === 'help') {
      this.io.info(HELP_TEXT)
      return
    }

    if (command === '--version' || command === '-v') {
      this.io.info(this.version)
      return
    }

    const handler = this.commands[command]
    if (!handler) {
      throw new Error(`Unknown command: ${command}`)
    }

    await handler.execute(this.#buildRequest(command, rest))
  }

  /**
   * @param {'init' | 'dev' | 'build' | 'preview' | 'clean' | 'deploy' | 'context'} command
   * @param {string[]} args
   * @returns {Record<string, unknown>}
   */
  #buildRequest(command, args) {
    if (command === 'dev' || command === 'preview') {
      return {
        projectRoot: this.projectRoot,
        port: this.#parsePort(args),
      }
    }

    if (command === 'deploy') {
      return {
        projectRoot: this.projectRoot,
        target: args[0],
      }
    }

    if (command === 'context') {
      return {
        projectRoot: this.projectRoot,
        outputPath: args[0] ? path.resolve(this.projectRoot, args[0]) : undefined,
      }
    }

    return {
      projectRoot: this.projectRoot,
    }
  }

  /**
   * @param {string[]} args
   * @returns {number}
   */
  #parsePort(args) {
    const portIndex = args.findIndex(arg => arg === '--port' || arg === '-p')
    if (portIndex === -1) {
      return 4321
    }

    const raw = args[portIndex + 1]
    const value = Number(raw)
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error('Invalid --port value.')
    }
    return value
  }
}
