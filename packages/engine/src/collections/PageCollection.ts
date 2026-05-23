import type { DocsMintConfig } from '@docsmint/config'
import { resolveCollectionIndexDisplay } from '@docsmint/config'
import { getCollection } from 'astro:content'
import { onlyPublished } from '@/utils/published'
import {
  getCollectionBasePath,
  getCollectionEntrySlug,
} from '@/utils/collections'
import { isSearchExcluded } from '@/search/exclusion'
import type { SiteRouteDefinition } from '@/routing/types'
import { resolveCollectionRouteViewKey } from '@/routing/view-registry'
import type { RouteViewBundle } from '@/collections/bundle'
import type { ICollection } from '@/collections/ICollection'

export class PageCollection implements ICollection {
  readonly presentationTarget = 'page' as const

  constructor(private readonly site: DocsMintConfig) {}

  async buildIndex(route: SiteRouteDefinition): Promise<RouteViewBundle> {
    const collectionKey = route.collectionKey!
    const collection = this.site.collections?.[collectionKey]
    const basePath = getCollectionBasePath(this.site, collectionKey)
    const localePrefix = route.locale ? `/${route.locale}` : ''
    const localizedBase = `${localePrefix}${basePath}`.replace(/\/{2,}/g, '/') || basePath
    const entries = onlyPublished(await getCollection(collectionKey as 'pages'))

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
        title: (entry.data as { title?: string }).title ?? entry.id,
        href: `${localizedBase}/${getCollectionEntrySlug(entry.id)}`,
      })),
      collectionDisplay: resolveCollectionIndexDisplay(collection?.display),
    }
  }

  async buildEntry(route: SiteRouteDefinition): Promise<RouteViewBundle> {
    const collectionKey = route.collectionKey!
    const entries = onlyPublished(await getCollection(collectionKey as 'pages'))
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
      title: (entry.data as { title?: string }).title ?? entry.id,
      description: (entry.data as { description?: string }).description,
      headings: [],
      pagefindIgnore:
        (entry.data as { search?: boolean }).search === false || isSearchExcluded(this.site, pagePath),
    }
  }
}
