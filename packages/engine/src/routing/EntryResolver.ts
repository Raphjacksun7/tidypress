import { getCollection } from 'astro:content'
import { onlyPublished } from '@/utils/published'
import { getCollectionEntrySlug } from '@/utils/collections'
import type { SiteRouteDefinition } from '@/routing/types'

export class EntryResolver {
  async resolve(route: SiteRouteDefinition) {
    if (!route.collectionKey) {
      return undefined
    }
    const entries = onlyPublished(await getCollection(route.collectionKey as 'docs'))
    if (route.entryId) {
      return entries.find(entry => entry.id === route.entryId)
    }
    if (route.slug) {
      return entries.find(entry => getCollectionEntrySlug(entry.id) === route.slug)
    }
    return undefined
  }
}
