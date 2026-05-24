/** Pagefind filter namespace for collection-scoped search. */
export const PAGEFIND_COLLECTION_FILTER_KEY = 'collection'

export function pagefindCollectionFilter(collectionKey: string | undefined): string | undefined {
  if (!collectionKey) {
    return undefined
  }
  return `${PAGEFIND_COLLECTION_FILTER_KEY}:${collectionKey}`
}

export type PagefindContentAttributes = {
  'data-pagefind-ignore'?: true
  'data-pagefind-filter'?: string
}

export function resolvePagefindContentAttributes(options: {
  collectionKey?: string
  pagefindIgnore?: boolean
}): PagefindContentAttributes {
  if (options.pagefindIgnore) {
    return { 'data-pagefind-ignore': true }
  }
  const filter = pagefindCollectionFilter(options.collectionKey)
  return filter ? { 'data-pagefind-filter': filter } : {}
}
