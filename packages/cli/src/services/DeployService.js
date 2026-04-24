/**
 * Executes deployment using composable strategy objects.
 */
export class DeployService {
  /**
   * @param {{ strategies: Array<import('../deployment/DeployStrategies.js').DeployStrategy> }} dependencies
   */
  constructor({ strategies }) {
    this.strategies = strategies
  }

  /**
   * @param {{ projectRoot: string, distDir: string, target?: string }} request
   * @returns {Promise<void>}
   */
  async deploy(request) {
    const strategy = this.strategies.find(candidate => candidate.supports(request))
    if (!strategy) {
      throw new Error('No deployment strategy matched the given target.')
    }
    await strategy.execute(request)
  }
}
