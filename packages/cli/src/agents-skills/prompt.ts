import readline from 'node:readline/promises'

/**
 * @returns {boolean}
 */
export function isCiEnvironment() {
  return Boolean(
    process.env.CI ||
      process.env.CONTINUOUS_INTEGRATION ||
      process.env.GITHUB_ACTIONS ||
      process.env.GITLAB_CI,
  )
}

/**
 * @returns {boolean}
 */
export function isInteractiveTerminal() {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY)
}

/**
 * @param {string} message
 * @param {{ defaultValue?: boolean }} [options]
 * @returns {Promise<boolean>}
 */
export async function confirm(message, { defaultValue = true } = {}) {
  if (!isInteractiveTerminal()) {
    return defaultValue
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  const suffix = defaultValue ? '(Y/n)' : '(y/N)'
  const answer = await rl.question(`${message} ${suffix} `)
  rl.close()

  const normalized = answer.trim().toLowerCase()
  if (!normalized) {
    return defaultValue
  }
  return normalized.startsWith('y')
}
