/**
 * Shared typed error for user-facing CLI failures.
 */
export class TidyPressError extends Error {
  /**
   * @param {string} message
   * @param {string} [code]
   * @param {string} [hint]
   * @param {{ cause?: unknown, exitCode?: number }} [options]
   */
  constructor(message, code = 'TIDYPRESS_ERROR', hint, options = {}) {
    super(message, options)
    this.name = 'TidyPressError'
    this.code = code
    this.hint = hint
    this.exitCode = options.exitCode ?? 1
  }

  /**
   * @returns {string}
   */
  formatUserMessage() {
    if (!this.hint) {
      return this.message
    }
    return `${this.message}\nHint: ${this.hint}`
  }
}
