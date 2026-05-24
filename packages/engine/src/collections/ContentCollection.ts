import type { DocsMintConfig } from '@docsmint/config'
import { sortDocs } from '@/utils/sort'
import { loadPublishedCollectionEntries } from '@/utils/collection-entries'
import {
  getCollectionBasePath,
  getCollectionEntryPath,
  getCollectionEntrySlug,
} from '@/utils/collections'
import { isSearchExcluded } from '@/search/exclusion'
import { versionContentPrefix } from '@/routing/versioning'
import type { SiteRouteDefinition } from '@/routing/types'
import { resolveCollectionRouteViewKey } from '@/routing/view-registry'
import type { RouteViewBundle } from '@/collections/bundle'
import type { ICollection } from '@/collections/ICollection'

type CollectionEntry = {
  title?: string
  description?: string
  search?: boolean
}

export class ContentCollection implements ICollection {
  readonly presentationTarget = 'content' as const

  constructor(private readonly site: DocsMintConfig) {}

  async buildIndex(route: SiteRouteDefinition): Promise<RouteViewBundle> {
    const collectionKey = route.collectionKey!
    const basePath = getCollectionBasePath(this.site, collectionKey)
    const localePrefix = route.locale ? `/${route.locale}` : ''
    const localizedBase = `${localePrefix}${basePath}`.replace(/\/{2,}/g, '/') || basePath

    const docs = sortDocs(await loadPublishedCollectionEntries<CollectionEntry>(collectionKey))
    const firstVersionPrefix = this.site.versions?.[0]
      ? versionContentPrefix(this.site.versions[0].path, basePath)
      : undefined
    const firstByVersion = firstVersionPrefix
      ? docs.find(entry => {
          const id = getCollectionEntrySlug(entry.id)
          return id === firstVersionPrefix || id.startsWith(`${firstVersionPrefix}/`)
        })
      : undefined
    const first = firstByVersion ?? docs[0]
    if (!first) {
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

    const firstHref = route.locale
      ? `${localizedBase}/${getCollectionEntrySlug(first.id)}`
      : getCollectionEntryPath(this.site, collectionKey, first.id)
    const pagePath = getCollectionEntryPath(this.site, collectionKey, first.id)

    return {
      viewKey: resolveCollectionRouteViewKey(this.presentationTarget, route),
      site: this.site,
      route,
      title: first.data.title ?? first.id,
      description: first.data.description,
      headings: [],
      pagefindIgnore: first.data.search === false || isSearchExcluded(this.site, pagePath),
      editPath: pagePath,
      collectionRootPath: localizedBase,
      firstDocHref: firstHref,
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
      : getCollectionEntryPath(this.site, collectionKey, entry.id)
    return {
      viewKey: resolveCollectionRouteViewKey(this.presentationTarget, route),
      site: this.site,
      route,
      title: entry.data.title ?? entry.id,
      description: entry.data.description,
      headings: [],
      pagefindIgnore: entry.data.search === false || isSearchExcluded(this.site, pagePath),
      editPath: getCollectionEntryPath(this.site, collectionKey, entry.id),
    }
  }
}
