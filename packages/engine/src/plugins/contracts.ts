import type { DocsMintConfig } from '@docsmint/config'
import type { SiteRouteDefinition } from '@/routing/types'
import type { RouteViewBundle } from '@/collections/bundle'

/** User-implemented collection presentation loaded from `collections.*.render.presentation`. */
export interface DocsMintPluginPresentation {
  buildIndex(route: SiteRouteDefinition): Promise<RouteViewBundle>
  buildEntry(route: SiteRouteDefinition): Promise<RouteViewBundle>
}

export type DocsMintPluginPresentationFactory = (
  site: DocsMintConfig,
  context: { collectionKey: string },
) => DocsMintPluginPresentation | Promise<DocsMintPluginPresentation>
