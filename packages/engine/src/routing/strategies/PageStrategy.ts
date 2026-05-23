import type { ICollectionRouteStrategy, CollectionRouteContext, SiteRouteDefinition } from '@/routing/types'
import { RoutePath } from '@/routing/RoutePath'
import { collectionBasePath, defineRoute, planDefaultEntryRoutes } from '@/routing/route-planning'

export class PageStrategy implements ICollectionRouteStrategy {
  readonly strategyKind = 'page' as const

  supports(context: CollectionRouteContext): boolean {
    return context.collection.kind === 'page'
  }

  plan(context: CollectionRouteContext): SiteRouteDefinition[] {
    const base = RoutePath.fromPathname(`/${collectionBasePath(context.site, context.collection.key)}`)
    return [
      defineRoute(base, {
        mode: 'collection-index',
        collectionKey: context.collection.key,
      }),
      ...planDefaultEntryRoutes(context.site, context.collection.key, context.entries),
    ]
  }
}
