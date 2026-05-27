import type { TidyPressCollectionKind } from '@tidypress/config'
import type { SiteRouteDefinition } from '@/routing/types'
import type { RouteViewBundle } from '@/collections/bundle'

export type CollectionPresentationTarget = TidyPressCollectionKind | 'site-docs'

export interface ICollection {
  readonly presentationTarget: CollectionPresentationTarget
  buildIndex(route: SiteRouteDefinition): Promise<RouteViewBundle>
  buildEntry(route: SiteRouteDefinition): Promise<RouteViewBundle>
}
