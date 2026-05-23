import type { ICollectionRouteStrategy } from '@/routing/types'
import { ContentStrategy } from '@/routing/strategies/ContentStrategy'
import { PageStrategy } from '@/routing/strategies/PageStrategy'
import { DocsStrategy } from '@/routing/strategies/DocsStrategy'
import { WritingStrategy } from '@/routing/strategies/WritingStrategy'

export class RouteRegistry {
  private readonly strategies: ICollectionRouteStrategy[]

  constructor(strategies: ICollectionRouteStrategy[] = [
    new DocsStrategy(),
    new ContentStrategy(),
    new WritingStrategy(),
    new PageStrategy(),
  ]) {
    this.strategies = strategies
  }

  resolve(strategyContext: Parameters<ICollectionRouteStrategy['supports']>[0]): ICollectionRouteStrategy {
    const strategy = this.strategies.find(candidate => candidate.supports(strategyContext))
    if (!strategy) {
      throw new Error(
        `No route strategy registered for collection "${strategyContext.collection.key}" (${strategyContext.collection.kind}).`,
      )
    }
    return strategy
  }
}
