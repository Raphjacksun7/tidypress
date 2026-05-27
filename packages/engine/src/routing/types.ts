import type { CollectionDefinition } from '@/utils/collections'

export type SiteRouteMode =
  | 'locale-home'
  | 'collection-index'
  | 'collection-entry'
  | 'version-root'
  | 'root-page'

export interface SiteRouteDefinition {
  /** URL pathname (e.g. `/fr/docs/getting-started`). */
  path: string
  mode: SiteRouteMode
  collectionKey?: string
  locale?: string
  slug?: string
  entryId?: string
  isVersionRoot?: boolean
  fallbackReason?: RouteFallbackReason
}

export type RouteLocaleMode = 'root-default'
export type RouteScope = 'site' | 'docs' | 'collection'
export type RouteFallbackReason = 'default-locale-content'

export interface RoutePolicy {
  localeMode: RouteLocaleMode
  versionScope: 'docs-only'
  defaultLocale: string
  locales: string[]
}

export interface CollectionRouteContext {
  site: import('@tidypress/config').TidyPressConfig
  collection: CollectionDefinition
  entries: Array<{ id: string; data: Record<string, unknown> }>
  locales: string[]
  defaultLocale: string
  usesLocaleRouting: boolean
}

export interface ICollectionRouteStrategy {
  readonly strategyKind: 'site-docs' | 'content' | 'writing' | 'page' | 'locale-home' | 'config-pages'
  supports(context: CollectionRouteContext): boolean
  plan(context: CollectionRouteContext): SiteRouteDefinition[]
}
