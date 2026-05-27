import { TidyPressError } from '../errors/TidyPressError.js'
import { assertDeploymentStrategy } from './DeploymentStrategy.js'

/**
 * Registry for deployment strategy plugins.
 */
export class DeploymentStrategyRegistry {
  /**
   * @param {{ strategies?: Array<import('./DeploymentStrategy.js').DeploymentStrategy> }} [options]
   */
  constructor({ strategies = [] } = {}) {
    /** @type {Array<import('./DeploymentStrategy.js').DeploymentStrategy>} */
    this.strategies = []
    for (const strategy of strategies) {
      this.register(strategy)
    }
  }

  /**
   * @param {import('./DeploymentStrategy.js').DeploymentStrategy} strategy
   */
  register(strategy) {
    assertDeploymentStrategy(strategy)

    if (this.strategies.some(candidate => candidate.id === strategy.id)) {
      throw new TidyPressError(
        `Duplicate deployment strategy id: ${strategy.id}`,
        'DEPLOY_STRATEGY_DUPLICATE',
        'Use unique strategy ids when registering deploy plugins',
      )
    }

    this.strategies.push(strategy)
  }

  /**
   * @returns {string[]}
   */
  listIds() {
    return this.strategies.map(strategy => strategy.id)
  }

  /**
   * @param {import('./DeploymentStrategy.js').DeployRequest} request
   * @returns {import('./DeploymentStrategy.js').DeploymentStrategy | undefined}
   */
  resolve(request) {
    return this.strategies.find(strategy => strategy.supports(request))
  }
}
