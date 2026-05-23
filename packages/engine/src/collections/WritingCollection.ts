import type { DocsMintConfig } from '@docsmint/config'
import { resolveCollectionIndexDisplay } from '@docsmint/config'
import { getCollection } from 'astro:content'
import { onlyPublished } from '@/utils/published'
import {
  getCollectionBasePath,
  getCollectionEntryPath,
  getCollectionEntrySlug,
} from '@/utils/collections'
import { localizeEntries, resolveLocale } from '@/i18n/locale'
import { isSearchExcluded } from '@/search/exclusion'
import type { SiteRouteDefinition } from '@/routing/types'
import { resolveCollectionRouteViewKey } from '@/routing/view-registry'
import type { RouteViewBundle } from '@/collections/bundle'
import type { ICollection } from '@/collections/ICollection'

export class WritingCollection implements ICollection {
  readonly presentationTarget = 'writing' as const

  constructor(
    private readonly site: DocsMintConfig,
    private readonly dateFormatter: Intl.DateTimeFormat,
  ) {}

  async buildIndex(route: SiteRouteDefinition): Promise<RouteViewBundle> {
    const collectionKey = route.collectionKey!
    const collection = this.site.collections?.[collectionKey]
    const basePath = getCollectionBasePath(this.site, collectionKey)
    const localePrefix = route.locale ? `/${route.locale}` : ''
    const localizedBase = `${localePrefix}${basePath}`.replace(/\/{2,}/g, '/') || basePath

    const posts = onlyPublished(await getCollection(collectionKey as 'writing'))
    const localeState = resolveLocale(localizedBase, this.site.i18n)
    const localized = route.locale
      ? localizeEntries(posts, localeState, route.locale)
      : posts.map(entry => ({ entry, slug: entry.id, locale: route.locale ?? '' }))

    return {
      viewKey: resolveCollectionRouteViewKey(this.presentationTarget, route),
      site: this.site,
      route,
      title: collection?.label ?? collectionKey,
      description: this.site.writing?.description ?? this.site.description,
      headings: [],
      pagefindIgnore: true,
      indexEntries: localized
        .sort(
          (a, b) =>
            new Date((b.entry.data as { date?: string | Date }).date ?? 0).getTime() -
            new Date((a.entry.data as { date?: string | Date }).date ?? 0).getTime(),
        )
        .map(({ entry, slug }) => {
          const data = entry.data as {
            title?: string
            author?: string
            description?: string
            icon?: string
            tags?: string[]
            date?: string | Date
          }
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
    const entries = onlyPublished(await getCollection(collectionKey as 'writing'))
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
      title: (entry.data as { title?: string }).title ?? entry.id,
      description: (entry.data as { description?: string }).description,
      headings: [],
      pagefindIgnore:
        (entry.data as { search?: boolean }).search === false || isSearchExcluded(this.site, pagePath),
      entryMeta: {
        dateLabel: this.dateFormatter.format(
          new Date((entry.data as { date?: string | Date }).date as string | Date),
        ),
        author: (entry.data as { author?: string }).author,
        tags: (entry.data as { tags?: string[] }).tags,
      },
    }
  }
}
