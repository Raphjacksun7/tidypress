import type { CollectionKey } from 'astro:content'
import type { DocsMintConfig } from '@docsmint/config'
import {
  isDocsCollectionKey,
  resolveDefaultHomeSectionKeys,
  resolveHomeCollectionDisplay,
} from '@docsmint/config'
import { getCollection } from 'astro:content'
import { sortDocs } from '@/utils/sort'
import {
  getCollectionBasePath,
  getCollectionEntryPath,
  getCollectionEntrySlug,
  isCollectionEnabled,
} from '@/utils/collections'
import { localizeEntries, resolveLocale } from '@/i18n/locale'

export interface HomePreviewItem {
  href: string
  title: string
  description?: string
  dateLabel?: string
  icon?: string
  tags?: string[]
}

type HomePreviewEntry = {
  id: string
  data: Record<string, unknown>
}

export function getHomePreviewLimit(site: DocsMintConfig): number {
  return site.home?.previewLimit ?? 5
}

export function getHomeSectionKeys(site: DocsMintConfig): string[] {
  if (site.home?.order?.length) {
    return site.home.order.filter(key => isCollectionEnabled(site, key))
  }
  return resolveDefaultHomeSectionKeys(site)
}

function isWritingLikeCollection(site: DocsMintConfig, collectionKey: string): boolean {
  return site.collections?.[collectionKey]?.kind === 'writing'
}

function sortCollectionEntries<T extends HomePreviewEntry>(
  site: DocsMintConfig,
  collectionKey: string,
  entries: T[],
): T[] {
  if (isWritingLikeCollection(site, collectionKey)) {
    return [...entries].sort(
      (a, b) =>
        new Date((b.data as { date?: string | Date }).date ?? 0).getTime() -
        new Date((a.data as { date?: string | Date }).date ?? 0).getTime(),
    )
  }
  return sortDocs(entries)
}

export async function buildHomePreviewItems(
  site: DocsMintConfig,
  collectionKey: string,
  options: {
    locale?: string
    dateFormatter: Intl.DateTimeFormat
    limit?: number
  },
): Promise<{ items: HomePreviewItem[]; moreHref?: string }> {
  const limit = options.limit ?? getHomePreviewLimit(site)
  const entries = (await getCollection(collectionKey as CollectionKey)).filter(entry => {
    const data = entry.data as { published?: boolean; scheduled?: Date }
    if (data.published === false) return false
    if (data.scheduled && data.scheduled > new Date()) return false
    return true
  }) as HomePreviewEntry[]
  const localeState = resolveLocale(options.locale ? `/${options.locale}` : '/', site.i18n)
  const activeLocale = options.locale ?? localeState.defaultLocale
  const localized = localizeEntries(entries, localeState, activeLocale)

  const sorted = sortCollectionEntries(
    site,
    collectionKey,
    localized.map(item => ({ ...item.entry, id: item.slug })),
  )

  const basePath = getCollectionBasePath(site, collectionKey)
  const localePrefix = options.locale ? `/${options.locale}` : ''

  const items = sorted.slice(0, limit).map(entry => {
    const data = entry.data as {
      title?: string
      description?: string
      icon?: string
      tags?: string[]
      date?: string | Date
    }
    const slug = entry.id
    const href = options.locale
      ? `${localePrefix}${basePath}/${getCollectionEntrySlug(slug)}`.replace(/\/{2,}/g, '/')
      : getCollectionEntryPath(site, collectionKey, slug)

    return {
      href,
      title: data.title ?? slug,
      description: data.description,
      icon: data.icon,
      tags: data.tags,
      dateLabel: isWritingLikeCollection(site, collectionKey) && data.date
        ? options.dateFormatter.format(new Date(data.date))
        : undefined,
    }
  })

  const moreHref =
    sorted.length > limit
      ? `${localePrefix}${basePath}`.replace(/\/{2,}/g, '/') || basePath
      : undefined

  return { items, moreHref }
}

export function resolveHomeDisplayForCollection(site: DocsMintConfig, collectionKey: string) {
  return resolveHomeCollectionDisplay(
    site.home,
    site.collections?.[collectionKey]?.display,
    site.home?.collections?.[collectionKey],
  )
}

export function homeSectionTitle(
  site: DocsMintConfig,
  collectionKey: string,
  strings: { writingTitle: string; docsTitle: string },
): string {
  const label = site.collections?.[collectionKey]?.label
  if (label) {
    return label
  }
  if (isWritingLikeCollection(site, collectionKey)) {
    return strings.writingTitle
  }
  if (isDocsCollectionKey(collectionKey)) {
    return strings.docsTitle
  }
  return collectionKey
}

export function homeSectionMoreLabel(
  site: DocsMintConfig,
  collectionKey: string,
  strings: { allWritingLabel: string; allDocsLabel: string },
): string {
  if (isWritingLikeCollection(site, collectionKey)) {
    return strings.allWritingLabel
  }
  if (isDocsCollectionKey(collectionKey)) {
    return strings.allDocsLabel
  }
  return `all ${collectionKey} ->`
}

export function isWritingSection(site: DocsMintConfig, collectionKey: string): boolean {
  return isWritingLikeCollection(site, collectionKey)
}

export function homePreviewListFlags(site: DocsMintConfig, collectionKey: string): {
  showDateInList: boolean
  showDescriptionInList: boolean
} {
  const homeDateSetting = site.home?.collections?.[collectionKey]?.showDate ?? site.home?.display?.showDate
  const showDateInList = isWritingSection(site, collectionKey) && homeDateSetting !== false
  return {
    showDateInList,
    showDescriptionInList: !showDateInList,
  }
}
