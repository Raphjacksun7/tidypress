import type { ICollectionRouteStrategy, CollectionRouteContext, SiteRouteDefinition } from '@/routing/types'
import { RoutePath } from '@/routing/RoutePath'
import { sortDocs } from '@/utils/sort'
import {
  collectionBasePath,
  defineRoute,
  planDefaultLocaleEntryRoutes,
  resolveLocaleState,
} from '@/routing/route-planning'

/** Reference-style collections (`kind: content`), e.g. playbooks — not the docs collection. */
export class ContentStrategy implements ICollectionRouteStrategy {
  readonly strategyKind = 'content' as const

  supports(context: CollectionRouteContext): boolean {
    return context.collection.kind === 'content'
  }

  plan(context: CollectionRouteContext): SiteRouteDefinition[] {
    const localeState = resolveLocaleState(context.site)
    const base = RoutePath.fromPathname(`/${collectionBasePath(context.site, context.collection.key)}`)
    const firstEntryId = this.resolveFirstEntryId(context)
    const routes: SiteRouteDefinition[] = [
      defineRoute(base, {
        mode: 'collection-index',
        collectionKey: context.collection.key,
        entryId: firstEntryId,
      }),
    ]

    routes.push(
      ...planDefaultLocaleEntryRoutes(context.site, context.collection.key, context.entries, localeState),
    )
    return routes
  }

  private resolveFirstEntryId(context: CollectionRouteContext): string | undefined {
    const docs = sortDocs(context.entries)
    return docs[0]?.id
  }
}
