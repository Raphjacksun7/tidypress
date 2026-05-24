/** Route slug segments for collection meta-index pages (tags, year archives). */
export const docsMintCollectionMetaIndexSegments = {
  tags: 'tags',
  archive: 'archive',
} as const

export type DocsMintCollectionMetaIndexSegment = keyof typeof docsMintCollectionMetaIndexSegments

export function collectionMetaIndexSlug(
  segment: DocsMintCollectionMetaIndexSegment,
  value: string,
): string {
  return `${docsMintCollectionMetaIndexSegments[segment]}/${value}`
}

export function parseCollectionMetaIndexSlug(
  slug: string | undefined,
  segment: DocsMintCollectionMetaIndexSegment,
): string | undefined {
  if (!slug) {
    return undefined
  }
  const prefix = `${docsMintCollectionMetaIndexSegments[segment]}/`
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
    docsMintCollectionMetaIndexSegments,
  ) as DocsMintCollectionMetaIndexSegment[]) {
    const value = parseCollectionMetaIndexSlug(slug, segment)
    if (value) {
      return `${value} — ${collectionLabel}`
    }
  }
  return collectionLabel
}
