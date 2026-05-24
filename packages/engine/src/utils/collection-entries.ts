import { getCollection, type CollectionKey } from 'astro:content'
import { onlyPublished, type PublishFlags } from '@/utils/published'

export type EngineCollectionEntry<T extends Record<string, unknown> = Record<string, unknown>> = {
  id: string
  body?: string
  data: T & PublishFlags
}

export async function loadPublishedCollectionEntries<
  T extends Record<string, unknown> = Record<string, unknown>,
>(collectionKey: string): Promise<EngineCollectionEntry<T>[]> {
  const entries = (await getCollection(collectionKey as CollectionKey)) as unknown as EngineCollectionEntry<T>[]
  return onlyPublished(entries)
}
