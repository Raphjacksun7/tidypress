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
import { planCollectionTagRoutes } from '@/routing/collection-meta-routes'

export class ProjectsStrategy implements ICollectionRouteStrategy {
  readonly strategyKind = 'content' as const

  supports(context: CollectionRouteContext): boolean {
    return context.collection.kind === 'projects'
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
      ...planCollectionTagRoutes(base, context.collection.key, context.entries),
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
          ...planCollectionTagRoutes(base, context.collection.key, context.entries, locale),
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
