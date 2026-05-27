import { TidyPressError } from '../errors/TidyPressError.js'
import { DeploymentStrategyRegistry } from '../deployment/DeploymentStrategyRegistry.js'

/**
 * Executes deployment using composable strategy objects.
 */
export class DeployService {
  /**
   * @param {{
   *   strategyRegistry?: DeploymentStrategyRegistry
   *   strategies?: Array<import('../deployment/DeploymentStrategy.js').DeploymentStrategy>
   * }} dependencies
   */
  constructor({ strategyRegistry, strategies = [] }) {
    this.strategyRegistry = strategyRegistry ?? new DeploymentStrategyRegistry({ strategies })
  }

  /**
   * @param {{ projectRoot: string, distDir: string, target?: string }} request
   * @returns {Promise<void>}
   */
  async deploy(request) {
    const strategy = this.strategyRegistry.resolve(request)
    if (!strategy) {
      throw new TidyPressError(
        'No deployment strategy matched the given target.',
        'DEPLOY_NO_STRATEGY',
        'Run tidypress deploy --help or use a known provider target',
        { exitCode: 2 },
      )
    }
    await strategy.execute(request)
  }
}
