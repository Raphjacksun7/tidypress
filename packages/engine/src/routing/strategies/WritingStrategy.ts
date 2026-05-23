import type { ICollectionRouteStrategy, CollectionRouteContext, SiteRouteDefinition } from '@/routing/types'
import { RoutePath } from '@/routing/RoutePath'
import {
  collectionBasePath,
  defineRoute,
  nonDefaultLocales,
  planDefaultLocaleEntryRoutes,
  planLocalizedEntryRoutes,
  resolveLocaleState,
  resolveRoutePolicy,
} from '@/routing/route-planning'

export class WritingStrategy implements ICollectionRouteStrategy {
  readonly strategyKind = 'writing' as const

  supports(context: CollectionRouteContext): boolean {
    return context.collection.kind === 'writing'
  }

  plan(context: CollectionRouteContext): SiteRouteDefinition[] {
    const localeState = resolveLocaleState(context.site)
    const policy = resolveRoutePolicy(context.site)
    const base = RoutePath.fromPathname(`/${collectionBasePath(context.site, context.collection.key)}`)
    const routes: SiteRouteDefinition[] = [
      defineRoute(base, {
        mode: 'collection-index',
        collectionKey: context.collection.key,
      }),
      ...planDefaultLocaleEntryRoutes(context.site, context.collection.key, context.entries, localeState),
    ]

    if (context.usesLocaleRouting) {
      for (const locale of nonDefaultLocales(policy)) {
        routes.push(
          defineRoute(base.withLocale(locale), {
            mode: 'collection-index',
            collectionKey: context.collection.key,
            locale,
          }),
          ...planLocalizedEntryRoutes(
            context.site,
            context.collection.key,
            context.entries,
            locale,
            localeState,
            { prefixLocale: true },
          ),
        )
      }
    }
    return routes
  }
}
