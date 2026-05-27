import type { TidyPressConfig } from '@tidypress/config'
import { getCollectionBasePath, getCollectionEntryPath, getCollectionEntrySlug } from '@/utils/collections'

type EntryData = {
  url?: string
  repo?: string
  linkOnly?: boolean
}

export function resolveEntryHrefFromData(
  site: TidyPressConfig,
  collectionKey: string,
  entryId: string,
  data: EntryData,
  options: { locale?: string } = {},
): { href: string; external: boolean } {
  if (data.url) {
    return { href: data.url, external: true }
  }
  if (data.repo) {
    return { href: data.repo, external: true }
  }

  const basePath = getCollectionBasePath(site, collectionKey)
  const localePrefix = options.locale ? `/${options.locale}` : ''
  const slug = getCollectionEntrySlug(entryId)
  const href = options.locale
    ? `${localePrefix}${basePath}/${slug}`.replace(/\/{2,}/g, '/')
    : getCollectionEntryPath(site, collectionKey, entryId)

  return { href, external: false }
}

export function sortByFeaturedThenDate<T extends { data: Record<string, unknown> }>(
  entries: T[],
  dateKey = 'date',
): T[] {
  return [...entries].sort((a, b) => {
    const aFeatured = (a.data as { featured?: boolean }).featured === true ? 1 : 0
    const bFeatured = (b.data as { featured?: boolean }).featured === true ? 1 : 0
    if (aFeatured !== bFeatured) {
      return bFeatured - aFeatured
    }
    const aDate = new Date((a.data as Record<string, string | Date>)[dateKey] ?? 0).getTime()
    const bDate = new Date((b.data as Record<string, string | Date>)[dateKey] ?? 0).getTime()
    return bDate - aDate
  })
}
