import { parseCollectionMetaIndexSlug } from '@docsmint/config'

type TaggedEntry = { data: { tags?: string[] } }
type DatedEntry = { data: { date?: string | Date } }

export function filterCollectionIndexEntries<T extends TaggedEntry & DatedEntry>(
  entries: T[],
  slug: string | undefined,
): T[] {
  const tag = parseCollectionMetaIndexSlug(slug, 'tags')
  if (tag) {
    return entries.filter(entry => (entry.data.tags ?? []).includes(tag))
  }

  const archiveYear = parseCollectionMetaIndexSlug(slug, 'archive')
  if (archiveYear) {
    return entries.filter(entry => {
      const date = entry.data.date
      if (!date) {
        return false
      }
      return new Date(date).getUTCFullYear().toString() === archiveYear
    })
  }

  return entries
}
