import type { TidyPressConfig } from '@tidypress/config'
import { resolveCollectionIndexDisplay, resolveCollectionMetaIndexTitle } from '@tidypress/config'
import { filterCollectionIndexEntries } from '@/utils/collection-meta-index-entries'
import { loadPublishedCollectionEntries, type EngineCollectionEntry } from '@/utils/collection-entries'
import {
  getCollectionBasePath,
  getCollectionEntryPath,
  getCollectionEntrySlug,
} from '@/utils/collections'
import { localizeEntries, resolveLocale } from '@/i18n/locale'
import { isSearchExcluded } from '@/search/exclusion'
import { buildWritingChapterNav } from '@/routing/writing-chapter-nav'
import { estimateReadingTimeMinutes, formatReadingTimeLabel } from '@/utils/reading-time'
import type { SiteRouteDefinition } from '@/routing/types'
import { resolveCollectionRouteViewKey } from '@/routing/view-registry'
import type { RouteViewBundle } from '@/collections/bundle'
import type { ICollection } from '@/collections/ICollection'

type CollectionEntry = {
  title?: string
  author?: string
  description?: string
  icon?: string
  tags?: string[]
  date?: string | Date
  featured?: boolean
  search?: boolean
  ogImage?: string
}

export class WritingCollection implements ICollection {
  readonly presentationTarget = 'writing' as const

  constructor(
    private readonly site: TidyPressConfig,
    private readonly dateFormatter: Intl.DateTimeFormat,
  ) {}

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

    const allPosts = await loadPublishedCollectionEntries<CollectionEntry>(collectionKey)
    const posts = filterCollectionIndexEntries(allPosts, route.slug)
    const localeState = resolveLocale(localizedBase, this.site.i18n)
    const localized = route.locale
      ? localizeEntries(posts, localeState, route.locale)
      : posts.map(entry => ({ entry, slug: entry.id, locale: route.locale ?? '' }))

    const sorted = [...localized].sort((a, b) => {
      const aFeatured = a.entry.data.featured === true ? 1 : 0
      const bFeatured = b.entry.data.featured === true ? 1 : 0
      if (aFeatured !== bFeatured) {
        return bFeatured - aFeatured
      }
      return (
        new Date(b.entry.data.date ?? 0).getTime() -
        new Date(a.entry.data.date ?? 0).getTime()
      )
    })

    return {
      viewKey: resolveCollectionRouteViewKey(this.presentationTarget, route),
      site: this.site,
      route,
      title: this.indexTitle(route, collectionKey),
      description: this.site.writing?.description ?? this.site.description,
      headings: [],
      pagefindIgnore: true,
      indexEntries: sorted.map(({ entry, slug }) => {
        const data = entry.data
        const date = new Date(data.date as string | Date)
        return {
          slug,
          title: data.title ?? slug,
          author: data.author,
          description: data.description,
          icon: data.icon,
          tags: data.tags,
          dateLabel: this.dateFormatter.format(date),
          dateIso: date.toISOString().slice(0, 10),
          href: route.locale
            ? `${localizedBase}/${getCollectionEntrySlug(slug)}`
            : getCollectionEntryPath(this.site, collectionKey, slug),
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

    const basePath = getCollectionBasePath(this.site, collectionKey)
    const pagePath = route.locale
      ? `/${route.locale}${basePath}/${route.slug ?? getCollectionEntrySlug(entry.id)}`.replace(/\/{2,}/g, '/')
      : getCollectionEntryPath(this.site, collectionKey, entry.id)

    const body = 'body' in entry && typeof entry.body === 'string' ? entry.body : ''
    const readingMinutes = estimateReadingTimeMinutes(body)
    const chapterNav = buildWritingChapterNav(this.site, collectionKey, entries, route)
    const ogImage = entry.data.ogImage

    return {
      viewKey: resolveCollectionRouteViewKey(this.presentationTarget, route),
      site: this.site,
      route,
      title: entry.data.title ?? entry.id,
      description: entry.data.description,
      headings: [],
      pagefindIgnore: entry.data.search === false || isSearchExcluded(this.site, pagePath),
      entryMeta: {
        dateLabel: this.dateFormatter.format(
          new Date(entry.data.date as string | Date),
        ),
        author: entry.data.author,
        tags: entry.data.tags,
        readingTimeLabel: formatReadingTimeLabel(readingMinutes),
        ogImage,
        chapterNav,
        showChapterNavBottom: Boolean(chapterNav?.previous || chapterNav?.next),
      },
    }
  }
}
