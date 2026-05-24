import type { DocsMintConfig } from '../schema/types.js'
import { isSearchableCollectionKind } from '../registry/collection-kinds.js'
import { isStarterCollectionKey } from '../registry/legacy.js'
import { resolveCapabilityFlags } from '../registry/capabilities.js'

export interface DocsMintSearchFilterCollection {
  key: string
  label: string
}

export function resolveSearchFilterCollections(site: DocsMintConfig): DocsMintSearchFilterCollection[] {
  const capabilityFlags = resolveCapabilityFlags(site)
  const collections: DocsMintSearchFilterCollection[] = []

  for (const [key, collection] of Object.entries(site.collections ?? {})) {
    if (!collection) {
      continue
    }
    const enabled = isStarterCollectionKey(key)
      ? capabilityFlags[key as keyof typeof capabilityFlags]
      : collection.enabled === true
    if (!enabled) {
      continue
    }
    if (!isSearchableCollectionKind(collection.kind)) {
      continue
    }
    collections.push({
      key,
      label: collection.label ?? key,
    })
  }

  return collections
}
