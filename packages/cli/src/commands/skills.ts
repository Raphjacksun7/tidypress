import { maybeInstallTidyPressSkillsGlobally } from '../agents-skills/install.js'
import { TidyPressError } from '../errors/TidyPressError.js'

/**
 * Handles `tidypress skills <subcommand>`.
 */
export class SkillsCommand {
  io: any


  /**
   * @param {{ io: { info: (message: string) => void, warn?: (message: string) => void } }} dependencies
   */
  constructor({ io }) {
    this.io = io
  }

  /**
   * @param {{ subcommand?: string, force?: boolean }} request
   * @returns {Promise<void>}
   */
  async execute({ subcommand = 'install', force = false }) {
    if (subcommand === 'install') {
      const result = await maybeInstallTidyPressSkillsGlobally({ force, io: this.io })
      if (result.status === 'skipped' && result.reason === 'no_agents') {
        this.io.info(
          'No supported AI coding agents detected (Cursor, Claude Code, or Codex). Install skills manually — see skills/README.md in the TidyPress repository.',
        )
      }
      return
    }

    throw new TidyPressError(`Unknown skills subcommand: ${subcommand}`, 'UNKNOWN_COMMAND', 'Run: tidypress skills install', {
      exitCode: 2,
    })
  }
}
