import { collectionMetaIndexSlug } from '@tidypress/config'
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

function writingArchiveYears(entries: CollectionRouteContext['entries']): string[] {
  const years = new Set<string>()
  for (const entry of entries) {
    const date = (entry.data as { date?: string | Date }).date
    if (!date) {
      continue
    }
    years.add(new Date(date).getUTCFullYear().toString())
  }
  return [...years].sort((a, b) => Number(b) - Number(a))
}

function planWritingMetaIndexRoutes(
  base: RoutePath,
  collectionKey: string,
  entries: CollectionRouteContext['entries'],
  locale?: string,
): SiteRouteDefinition[] {
  const routes: SiteRouteDefinition[] = []
  const localizedBase = locale ? base.withLocale(locale) : base

  for (const year of writingArchiveYears(entries)) {
    const slug = collectionMetaIndexSlug('archive', year)
    routes.push(
      defineRoute(localizedBase.append(slug), {
        mode: 'collection-index',
        collectionKey,
        locale,
        slug,
      }),
    )
  }

  routes.push(...planCollectionTagRoutes(localizedBase, collectionKey, entries, locale))

  return routes
}

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
      ...planWritingMetaIndexRoutes(base, context.collection.key, context.entries),
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
          ...planWritingMetaIndexRoutes(base, context.collection.key, context.entries, locale),
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
