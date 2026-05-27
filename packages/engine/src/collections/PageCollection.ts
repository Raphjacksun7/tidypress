import type { TidyPressConfig } from '@tidypress/config'
import { resolveCollectionIndexDisplay } from '@tidypress/config'
import { loadPublishedCollectionEntries } from '@/utils/collection-entries'
import {
  getCollectionBasePath,
  getCollectionEntrySlug,
} from '@/utils/collections'
import { isSearchExcluded } from '@/search/exclusion'
import type { SiteRouteDefinition } from '@/routing/types'
import { resolveCollectionRouteViewKey } from '@/routing/view-registry'
import type { RouteViewBundle } from '@/collections/bundle'
import type { ICollection } from '@/collections/ICollection'

type CollectionEntry = {
  title?: string
  description?: string
  search?: boolean
}

export class PageCollection implements ICollection {
  readonly presentationTarget = 'page' as const

  constructor(private readonly site: TidyPressConfig) {}

  async buildIndex(route: SiteRouteDefinition): Promise<RouteViewBundle> {
    const collectionKey = route.collectionKey!
    const collection = this.site.collections?.[collectionKey]
    const basePath = getCollectionBasePath(this.site, collectionKey)
    const localePrefix = route.locale ? `/${route.locale}` : ''
    const localizedBase = `${localePrefix}${basePath}`.replace(/\/{2,}/g, '/') || basePath
    const entries = await loadPublishedCollectionEntries<CollectionEntry>(collectionKey)

    return {
      viewKey: resolveCollectionRouteViewKey(this.presentationTarget, route),
      site: this.site,
      route,
      title: collection?.label ?? collectionKey,
      description: collection?.label,
      headings: [],
      pagefindIgnore: true,
      indexEntries: entries.map(entry => ({
        slug: getCollectionEntrySlug(entry.id),
        title: entry.data.title ?? entry.id,
        href: `${localizedBase}/${getCollectionEntrySlug(entry.id)}`,
      })),
      collectionDisplay: resolveCollectionIndexDisplay(collection?.display),
    }
  }

  async buildEntry(route: SiteRouteDefinition): Promise<RouteViewBundle> {
    const collectionKey = route.collectionKey!
    const entries = await loadPublishedCollectionEntries<CollectionEntry>(collectionKey)
    const entry = entries.find(
      candidate => candidate.id === route.entryId || getCollectionEntrySlug(candidate.id) === route.slug,
    )
    if (!entry) {
      return {
        viewKey: resolveCollectionRouteViewKey(this.presentationTarget, route),
        site: this.site,
        route,
        title: 'Not found',
        headings: [],
        pagefindIgnore: true,
        redirectTo: '/404',
      }
    }

    const basePath = getCollectionBasePath(this.site, collectionKey)
    const pagePath = route.locale
      ? `/${route.locale}${basePath}/${route.slug ?? getCollectionEntrySlug(entry.id)}`.replace(/\/{2,}/g, '/')
      : `${basePath}/${getCollectionEntrySlug(entry.id)}`

    return {
      viewKey: resolveCollectionRouteViewKey(this.presentationTarget, route),
      site: this.site,
      route,
      title: entry.data.title ?? entry.id,
      description: entry.data.description,
      headings: [],
      pagefindIgnore: entry.data.search === false || isSearchExcluded(this.site, pagePath),
    }
  }
}
