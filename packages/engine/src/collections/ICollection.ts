import type { DocsMintCollectionKind } from '@docsmint/config'
import type { SiteRouteDefinition } from '@/routing/types'
import type { RouteViewBundle } from '@/collections/bundle'

export type CollectionPresentationTarget = DocsMintCollectionKind | 'site-docs'

export interface ICollection {
  readonly presentationTarget: CollectionPresentationTarget
  buildIndex(route: SiteRouteDefinition): Promise<RouteViewBundle>
  buildEntry(route: SiteRouteDefinition): Promise<RouteViewBundle>
}
