import { TidyPressError } from '../errors/TidyPressError.js'

/**
 * @typedef {{ projectRoot: string, distDir: string, target?: string }} DeployRequest
 */

/**
 * @typedef {{ id: string, supports: (request: DeployRequest) => boolean, execute: (request: DeployRequest) => Promise<void> }} DeploymentStrategy
 */

/**
 * @param {unknown} strategy
 * @returns {asserts strategy is DeploymentStrategy}
 */
export function assertDeploymentStrategy(strategy) {
  if (!strategy || typeof strategy !== 'object') {
    throw new TidyPressError(
      'Invalid deployment strategy plugin.',
      'DEPLOY_STRATEGY_INVALID',
      'Provide an object with id, supports(), and execute()',
    )
  }

  if (typeof strategy.id !== 'string' || strategy.id.length === 0) {
    throw new TidyPressError(
      'Deployment strategy plugin is missing a valid id.',
      'DEPLOY_STRATEGY_INVALID',
      'Use a non-empty string id (e.g. provider:vercel)',
    )
  }

  if (typeof strategy.supports !== 'function' || typeof strategy.execute !== 'function') {
    throw new TidyPressError(
      `Deployment strategy "${strategy.id}" has an invalid interface.`,
      'DEPLOY_STRATEGY_INVALID',
      'Implement supports(request) and execute(request) methods',
    )
  }
}
