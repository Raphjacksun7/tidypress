/**
 * Shared typed error for user-facing CLI failures.
 */
export class TidyPressError extends Error {
  code: string
  hint?: string
  exitCode: number

  constructor(
    message: string,
    code = 'TIDYPRESS_ERROR',
    hint?: string,
    options: { cause?: unknown; exitCode?: number } = {},
  ) {
    super(message, options)
    this.name = 'TidyPressError'
    this.code = code
    this.hint = hint
    this.exitCode = options.exitCode ?? 1
  }

  formatUserMessage(): string {
    if (!this.hint) {
      return this.message
    }
    return `${this.message}\nHint: ${this.hint}`
  }
}
