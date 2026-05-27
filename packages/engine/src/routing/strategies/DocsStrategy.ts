import { isDocsCollectionKey } from '@tidypress/config'
import type { ICollectionRouteStrategy, CollectionRouteContext, SiteRouteDefinition } from '@/routing/types'
import { buildDocsRouteMatrix } from '@/routing/docs-route-matrix'

/** Routes only the `docs` collection key — product documentation, not a reusable kind. */
export class DocsStrategy implements ICollectionRouteStrategy {
  readonly strategyKind = 'site-docs' as const

  supports(context: CollectionRouteContext): boolean {
    return isDocsCollectionKey(context.collection.key)
  }

  plan(context: CollectionRouteContext): SiteRouteDefinition[] {
    return buildDocsRouteMatrix(context.site, context.collection.key, context.entries)
  }
}
