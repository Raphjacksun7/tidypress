import path from 'node:path'

import { TidyPressError } from '../errors/TidyPressError.js'

const HELP_TEXT = `tidypress <command> [options]

Commands:
  init       Scaffold docs/ in current directory (--preset <name>)
  migrate-sections  Generate sections->collections migration output
  dev        Start dev server
  build      Build production site (--output <dir>)
  preview    Preview production build
  clean      Remove docs/build/ and local tidypress cache
  deploy     Deploy using registered strategy plugins
  domain     Print custom domain setup plan
  context    Emit an LLM-friendly docs snapshot
  skills     Install TidyPress agent skills (skills install)
  import     Create content scaffolds from supported source providers
  doctor     Verify baseline docs setup
  release-check  Verify package release metadata
  add-version    Scaffold docs version folder (--set-latest)
  editor     Experimental web editor scaffold (requires explicit flags)
  export     Experimental multiformat export scaffold (requires explicit flags)
  ai         Experimental AI workflow scaffold (requires explicit flags)
`

/**
 * @typedef {import('../types.js').CliIo} ApplicationIO
 * @typedef {import('../types.js').CommandHandler} CommandHandler
 * @typedef {import('../types.js').CommandMap} CommandMap
 * @typedef {import('../types.js').CliCommandName} CliCommandName
 */

/**
 * Application orchestrates CLI argument parsing and command dispatch.
 */
export class Application {
  /**
   * @param {{
   *   version: string
   *   projectRoot: string
   *   commands: CommandMap
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

    const commandName = /** @type {CliCommandName} */ (command)
    const handler = this.commands[commandName]
    if (!handler) {
      throw new TidyPressError(`Unknown command: ${command}`, 'UNKNOWN_COMMAND', 'Run tidypress --help', { exitCode: 2 })
    }

    await handler.execute(this.#buildRequest(commandName, rest))
  }

  /**
   * @param {CliCommandName} command
   * @param {string[]} args
   * @returns {Record<string, unknown>}
   */
  #buildRequest(command, args) {
    if (command === 'init') {
      return this.#parseInitRequest(args)
    }

    if (command === 'migrate-sections') {
      return this.#parseMigrateSectionsRequest(args)
    }

    if (command === 'dev' || command === 'preview') {
      return {
        projectRoot: this.projectRoot,
        port: this.#parsePort(args),
      }
    }

    if (command === 'build') {
      return {
        projectRoot: this.projectRoot,
        outputPath: this.#parseOutput(args),
      }
    }

    if (command === 'deploy') {
      return this.#parseDeployRequest(args)
    }

    if (command === 'domain') {
      return this.#parseDomainRequest(args)
    }

    if (command === 'context') {
      return {
        projectRoot: this.projectRoot,
        outputPath: args[0] ? path.resolve(this.projectRoot, args[0]) : undefined,
      }
    }

    if (command === 'skills') {
      return this.#parseSkillsRequest(args)
    }

    if (command === 'add-version') {
      return this.#parseAddVersionRequest(args)
    }

    if (command === 'import') {
      return this.#parseImportRequest(args)
    }

    if (command === 'editor') {
      return this.#parseEditorRequest(args)
    }

    if (command === 'export') {
      return this.#parseExportRequest(args)
    }

    if (command === 'ai') {
      return this.#parseAiRequest(args)
    }

    return {
      projectRoot: this.projectRoot,
    }
  }

  /**
   * @param {string[]} args
   * @returns {{ projectRoot: string, starterPreset?: string, withAstro: boolean }}
   */
  #parseInitRequest(args) {
    /** @type {string | undefined} */
    let starterPreset
    let withAstro = false
    for (let index = 0; index < args.length; index += 1) {
      const arg = args[index]
      if (arg === '--with-astro') {
        withAstro = true
        continue
      }
      if (arg === '--preset' || arg === '--starter') {
        const value = args[index + 1]
        if (!value || value.startsWith('-')) {
          throw new TidyPressError(
            `Missing value for ${arg}.`,
            'INVALID_INIT_OPTION',
            'Use tidypress init [--preset <name>]',
            { exitCode: 2 },
          )
        }
        starterPreset = value
        index += 1
        continue
      }
      if (arg.startsWith('--preset=') || arg.startsWith('--starter=')) {
        const value = arg.slice(arg.indexOf('=') + 1)
        if (!value) {
          throw new TidyPressError(
            `Missing value for ${arg.split('=')[0]}.`,
            'INVALID_INIT_OPTION',
            'Use tidypress init [--preset <name>]',
            { exitCode: 2 },
          )
        }
        starterPreset = value
        continue
      }
      throw new TidyPressError(
        `Unknown init option: ${arg}`,
        'INVALID_INIT_OPTION',
        'Use tidypress init [--preset <name>]',
        { exitCode: 2 },
      )
    }
    return {
      projectRoot: this.projectRoot,
      starterPreset,
      withAstro,
    }
  }

  /**
   * @param {string[]} args
   * @returns {{ subcommand: string, force: boolean }}
   */
  #parseSkillsRequest(args) {
    let subcommand = 'install'
    let force = false

    for (const arg of args) {
      if (arg === '--force') {
        force = true
        continue
      }
      if (arg.startsWith('-')) {
        throw new TidyPressError(
          `Unknown skills option: ${arg}`,
          'INVALID_SKILLS_OPTION',
          'Use tidypress skills install [--force]',
          { exitCode: 2 },
        )
      }
      if (subcommand !== 'install') {
        throw new TidyPressError(
          `Unexpected skills argument: ${arg}`,
          'INVALID_SKILLS_OPTION',
          'Use tidypress skills install [--force]',
          { exitCode: 2 },
        )
      }
      subcommand = arg
    }

    return { subcommand, force }
  }

  /**
   * @param {string[]} args
   * @returns {{ projectRoot: string }}
   */
  #parseMigrateSectionsRequest(args) {
    if (args.length > 0) {
      throw new TidyPressError(
        `Unknown migrate-sections option: ${args[0]}`,
        'INVALID_MIGRATE_SECTIONS_OPTION',
        'Use tidypress migrate-sections',
        { exitCode: 2 },
      )
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
      throw new TidyPressError('Invalid --port value.', 'INVALID_PORT', 'Use a positive number, e.g. --port 4321', {
        exitCode: 2,
      })
    }
    return value
  }

  /**
   * @param {string[]} args
   * @returns {string | undefined}
   */
  #parseOutput(args) {
    const index = args.findIndex(arg => arg === '--output' || arg === '-o')
    if (index === -1) {
      return undefined
    }
    const value = args[index + 1]
    if (!value) {
      throw new TidyPressError('Missing value for --output.', 'INVALID_OUTPUT', 'Pass a directory, e.g. --output ./dist', {
        exitCode: 2,
      })
    }
    return path.resolve(this.projectRoot, value)
  }

  /**
   * @param {string[]} args
   * @returns {{ projectRoot: string, target?: string, withCi: boolean }}
   */
  #parseDeployRequest(args) {
    /** @type {string | undefined} */
    let target
    let withCi = false
    for (const arg of args) {
      if (arg === '--with-ci') {
        withCi = true
        continue
      }
      if (arg.startsWith('-')) {
        throw new TidyPressError(
          `Unknown deploy option: ${arg}`,
          'INVALID_DEPLOY_OPTION',
          'Use tidypress deploy [target] [--with-ci]',
          { exitCode: 2 },
        )
      }
      if (target) {
        throw new TidyPressError(
          `Unexpected deploy argument: ${arg}`,
          'INVALID_DEPLOY_OPTION',
          'Use tidypress deploy [target] [--with-ci]',
          { exitCode: 2 },
        )
      }
      target = arg
    }
    return {
      projectRoot: this.projectRoot,
      target,
      withCi,
    }
  }

  /**
   * @param {string[]} args
   * @returns {{ projectRoot: string, action: 'setup', domain?: string, platform: string }}
   */
  #parseDomainRequest(args) {
    const [action, ...rest] = args
    if (!action) {
      throw new TidyPressError(
        'Missing domain subcommand.',
        'INVALID_DOMAIN_OPTION',
        'Use tidypress domain setup [domain] --platform <platform>',
        { exitCode: 2 },
      )
    }
    if (action !== 'setup') {
      throw new TidyPressError(
        `Unknown domain subcommand: ${action}`,
        'INVALID_DOMAIN_OPTION',
        'Use tidypress domain setup [domain] --platform <platform>',
        { exitCode: 2 },
      )
    }

    /** @type {string | undefined} */
    let domain
    /** @type {string | undefined} */
    let platform
    for (let index = 0; index < rest.length; index += 1) {
      const arg = rest[index]
      if (arg === '--platform') {
        platform = rest[index + 1]
        if (!platform || platform.startsWith('-')) {
          throw new TidyPressError(
            'Missing value for --platform.',
            'INVALID_DOMAIN_OPTION',
            'Use tidypress domain setup [domain] --platform <platform>',
            { exitCode: 2 },
          )
        }
        index += 1
        continue
      }
      if (arg.startsWith('--platform=')) {
        platform = arg.slice('--platform='.length)
        if (!platform) {
          throw new TidyPressError(
            'Missing value for --platform.',
            'INVALID_DOMAIN_OPTION',
            'Use tidypress domain setup [domain] --platform <platform>',
            { exitCode: 2 },
          )
        }
        continue
      }
      if (arg.startsWith('-')) {
        throw new TidyPressError(
          `Unknown domain option: ${arg}`,
          'INVALID_DOMAIN_OPTION',
          'Use tidypress domain setup [domain] --platform <platform>',
          { exitCode: 2 },
        )
      }
      if (domain) {
        throw new TidyPressError(
          `Unexpected domain argument: ${arg}`,
          'INVALID_DOMAIN_OPTION',
          'Use tidypress domain setup [domain] --platform <platform>',
          { exitCode: 2 },
        )
      }
      domain = arg
    }
    if (!platform) {
      throw new TidyPressError(
        'Missing required --platform option.',
        'INVALID_DOMAIN_OPTION',
        'Use tidypress domain setup [domain] --platform <platform>',
        { exitCode: 2 },
      )
    }

    return {
      projectRoot: this.projectRoot,
      action,
      domain,
      platform,
    }
  }

  /**
   * @param {string[]} args
   * @returns {{ projectRoot: string, versionLabel: string, setLatest: boolean }}
   */
  #parseAddVersionRequest(args) {
    let setLatest = false
    /** @type {string | undefined} */
    let versionLabel
    for (const arg of args) {
      if (arg === '--set-latest') {
        setLatest = true
        continue
      }
      if (arg.startsWith('-')) {
        throw new TidyPressError(
          `Unknown add-version option: ${arg}`,
          'INVALID_ADD_VERSION_OPTION',
          'Use tidypress add-version <label> [--set-latest]',
          { exitCode: 2 },
        )
      }
      if (versionLabel) {
        throw new TidyPressError(
          `Unexpected add-version argument: ${arg}`,
          'INVALID_ADD_VERSION_OPTION',
          'Use tidypress add-version <label> [--set-latest]',
          { exitCode: 2 },
        )
      }
      versionLabel = arg
    }

    if (!versionLabel) {
      throw new TidyPressError(
        'Missing version label for add-version.',
        'INVALID_ADD_VERSION_OPTION',
        'Use tidypress add-version <label> [--set-latest]',
        { exitCode: 2 },
      )
    }

    return {
      projectRoot: this.projectRoot,
      versionLabel,
      setLatest,
    }
  }

  /**
   * @param {string[]} args
   * @returns {{ projectRoot: string, provider: 'medium' | 'devto' | 'substack' | 'ghost', source: string, scheduled?: string }}
   */
  #parseImportRequest(args) {
    /** @type {'medium' | 'devto' | 'substack' | 'ghost' | undefined} */
    let provider
    /** @type {string | undefined} */
    let url
    /** @type {string | undefined} */
    let username
    /** @type {string | undefined} */
    let exportPath
    /** @type {string | undefined} */
    let scheduled

    for (let index = 0; index < args.length; index += 1) {
      const arg = args[index]
      if (arg === 'medium' || arg === 'devto' || arg === 'substack' || arg === 'ghost') {
        if (provider) {
          throw new TidyPressError(
            `Unexpected import provider: ${arg}`,
            'INVALID_IMPORT_OPTION',
            'Use tidypress import <medium|devto|substack|ghost> [provider options]',
            { exitCode: 2 },
          )
        }
        provider = arg
        continue
      }

      if (arg === '--url' || arg === '--username' || arg === '--export' || arg === '--scheduled') {
        const value = args[index + 1]
        if (!value || value.startsWith('-')) {
          throw new TidyPressError(
            `Missing value for ${arg}.`,
            'INVALID_IMPORT_OPTION',
            'Use tidypress import <provider> with provider-specific options',
            { exitCode: 2 },
          )
        }
        if (arg === '--url') {
          url = value
        } else if (arg === '--username') {
          username = value
        } else if (arg === '--export') {
          exportPath = value
        } else {
          scheduled = value
        }
        index += 1
        continue
      }

      throw new TidyPressError(
        `Unknown import option: ${arg}`,
        'INVALID_IMPORT_OPTION',
        'Use tidypress import <medium|devto|substack|ghost> [provider options]',
        { exitCode: 2 },
      )
    }

    if (!provider) {
      throw new TidyPressError(
        'Missing import provider.',
        'INVALID_IMPORT_OPTION',
        'Use tidypress import <medium|devto|substack|ghost> [provider options]',
        { exitCode: 2 },
      )
    }

    /** @type {string | undefined} */
    let source
    if (provider === 'medium') {
      source = url
    } else if (provider === 'devto') {
      source = username
    } else {
      source = exportPath
    }
    if (!source) {
      const providerHint =
        provider === 'medium'
          ? '--url'
          : provider === 'devto'
            ? '--username'
            : '--export'
      throw new TidyPressError(
        `Missing required ${providerHint} for ${provider} import.`,
        'INVALID_IMPORT_OPTION',
        `Use tidypress import ${provider} ${providerHint} <value>`,
        { exitCode: 2 },
      )
    }

    return {
      projectRoot: this.projectRoot,
      provider,
      source,
      scheduled,
    }
  }

  /**
   * @param {string[]} args
   * @returns {{ projectRoot: string, enableExperimentalEditor: boolean }}
   */
  #parseEditorRequest(args) {
    const flag = '--enable-experimental-editor'
    for (const arg of args) {
      if (arg === flag) {
        continue
      }
      throw new TidyPressError(
        `Unknown editor option: ${arg}`,
        'INVALID_EDITOR_OPTION',
        `Use tidypress editor ${flag}`,
        { exitCode: 2 },
      )
    }
    return {
      projectRoot: this.projectRoot,
      enableExperimentalEditor: args.includes(flag),
    }
  }

  /**
   * @param {string[]} args
   * @returns {{ projectRoot: string, enableExperimentalExport: boolean, format: 'pdf' | 'epub' | 'archive', source?: string }}
   */
  #parseExportRequest(args) {
    const flag = '--enable-experimental-export'
    const positional = args.filter(arg => arg !== flag)
    const [format, source, extra] = positional
    const allowedFormats = new Set(['pdf', 'epub', 'archive'])
    if (!format || !allowedFormats.has(format)) {
      throw new TidyPressError(
        `Unknown export format: ${format ?? '(missing)'}`,
        'INVALID_EXPORT_OPTION',
        `Use tidypress export <pdf|epub|archive> [source] ${flag}`,
        { exitCode: 2 },
      )
    }
    if (extra) {
      throw new TidyPressError(
        `Unexpected export argument: ${extra}`,
        'INVALID_EXPORT_OPTION',
        `Use tidypress export <pdf|epub|archive> [source] ${flag}`,
        { exitCode: 2 },
      )
    }
    return {
      projectRoot: this.projectRoot,
      enableExperimentalExport: args.includes(flag),
      format: /** @type {'pdf' | 'epub' | 'archive'} */ (format),
      source,
    }
  }

  /**
   * @param {string[]} args
   * @returns {{ projectRoot: string, enableExperimentalAi: boolean, action: 'suggest' | 'translate' | 'changelog', args: string[] }}
   */
  #parseAiRequest(args) {
    const flag = '--enable-experimental-ai'
    const positional = args.filter(arg => arg !== flag)
    const [action, ...actionArgs] = positional
    const allowedActions = new Set(['suggest', 'translate', 'changelog'])
    if (!action || !allowedActions.has(action)) {
      throw new TidyPressError(
        `Unknown ai action: ${action ?? '(missing)'}`,
        'INVALID_AI_OPTION',
        `Use tidypress ai <suggest|translate|changelog> [args] ${flag}`,
        { exitCode: 2 },
      )
    }

    return {
      projectRoot: this.projectRoot,
      enableExperimentalAi: args.includes(flag),
      action: /** @type {'suggest' | 'translate' | 'changelog'} */ (action),
      args: actionArgs,
    }
  }
}
