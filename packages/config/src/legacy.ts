import type { DocsMintCollectionKind, DocsMintSections } from './schema.js'

export const starterCollectionKeys = ['docs', 'writing', 'pages'] as const
export type StarterCollectionKey = (typeof starterCollectionKeys)[number]

export const legacySectionKeys = ['docs', 'writing'] as const
export type LegacySectionKey = (typeof legacySectionKeys)[number]

const starterCollectionKindByKey: Record<StarterCollectionKey, DocsMintCollectionKind> = {
  docs: 'docs',
  writing: 'writing',
  pages: 'page',
}

export function isStarterCollectionKey(key: string): key is StarterCollectionKey {
  return (starterCollectionKeys as readonly string[]).includes(key)
}

export function inferStarterCollectionKind(key: string): DocsMintCollectionKind {
  if (isStarterCollectionKey(key)) {
    return starterCollectionKindByKey[key]
  }
  return 'docs'
}

export function isLegacySectionKey(key: string): key is LegacySectionKey {
  return (legacySectionKeys as readonly string[]).includes(key)
}

export function getLegacySectionForCollection(
  sections: DocsMintSections | undefined,
  key: string,
): DocsMintSections[LegacySectionKey] | undefined {
  if (!isLegacySectionKey(key)) {
    return undefined
  }
  return sections?.[key]
}

