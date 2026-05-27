import type { TidyPressConfig } from '@tidypress/config'
import type { SiteRouteDefinition } from '@/routing/types'
import type { RouteViewBundle } from '@/collections/bundle'

/** User-implemented collection presentation loaded from `collections.*.render.presentation`. */
export interface TidyPressPluginPresentation {
  buildIndex(route: SiteRouteDefinition): Promise<RouteViewBundle>
  buildEntry(route: SiteRouteDefinition): Promise<RouteViewBundle>
}

export type TidyPressPluginPresentationFactory = (
  site: TidyPressConfig,
  context: { collectionKey: string },
) => TidyPressPluginPresentation | Promise<TidyPressPluginPresentation>
