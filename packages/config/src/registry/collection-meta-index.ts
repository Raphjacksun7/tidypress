/** Route slug segments for collection meta-index pages (tags, year archives). */
export const tidyPressCollectionMetaIndexSegments = {
  tags: 'tags',
  archive: 'archive',
} as const

export type TidyPressCollectionMetaIndexSegment = keyof typeof tidyPressCollectionMetaIndexSegments

export function collectionMetaIndexSlug(
  segment: TidyPressCollectionMetaIndexSegment,
  value: string,
): string {
  return `${tidyPressCollectionMetaIndexSegments[segment]}/${value}`
}

export function parseCollectionMetaIndexSlug(
  slug: string | undefined,
  segment: TidyPressCollectionMetaIndexSegment,
): string | undefined {
  if (!slug) {
    return undefined
  }
  const prefix = `${tidyPressCollectionMetaIndexSegments[segment]}/`
  if (!slug.startsWith(prefix)) {
    return undefined
  }
  return decodeURIComponent(slug.slice(prefix.length))
}

export function resolveCollectionMetaIndexTitle(
  collectionLabel: string,
  slug: string | undefined,
): string {
  for (const segment of Object.keys(
    tidyPressCollectionMetaIndexSegments,
  ) as TidyPressCollectionMetaIndexSegment[]) {
    const value = parseCollectionMetaIndexSlug(slug, segment)
    if (value) {
      return `${value} — ${collectionLabel}`
    }
  }
  return collectionLabel
}
