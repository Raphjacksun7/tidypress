import type { DocsMintConfig } from '@docsmint/config'
import { resolveCollectionIndexDisplay, resolveCollectionMetaIndexTitle } from '@docsmint/config'
import { filterCollectionIndexEntries } from '@/utils/collection-meta-index-entries'
import { loadPublishedCollectionEntries } from '@/utils/collection-entries'
import { resolveEntryHrefFromData } from '@/utils/entry-href'
import { localizeEntries, resolveLocale } from '@/i18n/locale'
import { isSearchExcluded } from '@/search/exclusion'
import { getCollectionBasePath, getCollectionEntryPath, getCollectionEntrySlug } from '@/utils/collections'
import type { SiteRouteDefinition } from '@/routing/types'
import { resolveCollectionRouteViewKey } from '@/routing/view-registry'
import type { RouteViewBundle } from '@/collections/bundle'
import type { ICollection } from '@/collections/ICollection'

type CollectionEntry = {
  title?: string
  description?: string
  icon?: string
  tags?: string[]
  url?: string
  status?: string
  featured?: boolean
  linkOnly?: boolean
  search?: boolean
}

export class ProjectsCollection implements ICollection {
  readonly presentationTarget = 'projects' as const

  constructor(private readonly site: DocsMintConfig) {}

  private indexTitle(route: SiteRouteDefinition, collectionKey: string): string {
    const collection = this.site.collections?.[collectionKey]
    const label = collection?.label ?? collectionKey
    return resolveCollectionMetaIndexTitle(label, route.slug)
  }

  async buildIndex(route: SiteRouteDefinition): Promise<RouteViewBundle> {
    const collectionKey = route.collectionKey!
    const collection = this.site.collections?.[collectionKey]
    const basePath = getCollectionBasePath(this.site, collectionKey)
    const localePrefix = route.locale ? `/${route.locale}` : ''
    const localizedBase = `${localePrefix}${basePath}`.replace(/\/{2,}/g, '/') || basePath

    const allEntries = await loadPublishedCollectionEntries<CollectionEntry>(collectionKey)
    const entries = filterCollectionIndexEntries(allEntries, route.slug)
    const localeState = resolveLocale(localizedBase, this.site.i18n)
    const localized = route.locale
      ? localizeEntries(entries, localeState, route.locale)
      : entries.map(entry => ({ entry, slug: entry.id, locale: route.locale ?? '' }))

    const sorted = [...localized].sort((a, b) => {
      const aFeatured = a.entry.data.featured === true ? 1 : 0
      const bFeatured = b.entry.data.featured === true ? 1 : 0
      if (aFeatured !== bFeatured) {
        return bFeatured - aFeatured
      }
      const aTitle = a.entry.data.title ?? a.slug
      const bTitle = b.entry.data.title ?? b.slug
      return aTitle.localeCompare(bTitle)
    })

    return {
      viewKey: resolveCollectionRouteViewKey(this.presentationTarget, route),
      site: this.site,
      route,
      title: this.indexTitle(route, collectionKey),
      description: collection?.label ?? this.site.description,
      headings: [],
      pagefindIgnore: true,
      indexEntries: sorted.map(({ entry, slug }) => {
        const data = entry.data
        const { href, external } = resolveEntryHrefFromData(this.site, collectionKey, slug, data, {
          locale: route.locale,
        })
        return {
          slug,
          title: data.title ?? slug,
          description: data.description,
          icon: data.icon,
          tags: data.tags,
          href,
          external,
          status: data.status,
        }
      }),
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

    const data = entry.data
    if (data.linkOnly && data.url) {
      return {
        viewKey: resolveCollectionRouteViewKey(this.presentationTarget, route),
        site: this.site,
        route,
        title: data.title ?? entry.id,
        headings: [],
        pagefindIgnore: true,
        redirectTo: data.url,
      }
    }

    const pagePath = route.locale
      ? `/${route.locale}${getCollectionBasePath(this.site, collectionKey)}/${route.slug ?? getCollectionEntrySlug(entry.id)}`.replace(
          /\/{2,}/g,
          '/',
        )
      : getCollectionEntryPath(this.site, collectionKey, entry.id)

    return {
      viewKey: resolveCollectionRouteViewKey(this.presentationTarget, route),
      site: this.site,
      route,
      title: data.title ?? entry.id,
      description: entry.data.description,
      headings: [],
      pagefindIgnore: entry.data.search === false || isSearchExcluded(this.site, pagePath),
    }
  }
}
