import type { TidyPressConfig } from '@tidypress/config'
import { getCollectionEntrySlug, getLocalizedCollectionEntryPath } from '@/utils/collections'
import type { DocChapterNav, DocChapterNavLink } from '@/routing/chapter-nav'

type WritingEntry = {
  id: string
  data: Record<string, unknown> & {
    title?: string
    date?: string | Date
  }
}

function entryHref(
  site: TidyPressConfig,
  collectionKey: string,
  entry: WritingEntry,
  locale?: string,
): string {
  return getLocalizedCollectionEntryPath(site, collectionKey, entry.id, locale)
}

function matchesEntry(
  entry: WritingEntry,
  routeEntryId: string | undefined,
  routeSlug: string | undefined,
): boolean {
  if (routeEntryId && entry.id === routeEntryId) {
    return true
  }
  const slug = getCollectionEntrySlug(entry.id)
  return routeSlug !== undefined && slug === routeSlug
}

export function buildWritingChapterNav(
  site: TidyPressConfig,
  collectionKey: string,
  entries: WritingEntry[],
  route: { entryId?: string; slug?: string; locale?: string },
): DocChapterNav | undefined {
  const sorted = [...entries].sort(
    (a, b) =>
      new Date((b.data.date ?? 0) as string | Date).getTime() -
      new Date((a.data.date ?? 0) as string | Date).getTime(),
  )
  const index = sorted.findIndex(entry => matchesEntry(entry, route.entryId, route.slug))
  if (index < 0) {
    return undefined
  }

  const link = (entry: WritingEntry): DocChapterNavLink => ({
    title: entry.data.title ?? getCollectionEntrySlug(entry.id),
    href: entryHref(site, collectionKey, entry, route.locale),
  })

  return {
    previous: index < sorted.length - 1 ? link(sorted[index + 1]!) : undefined,
    next: index > 0 ? link(sorted[index - 1]!) : undefined,
  }
}
