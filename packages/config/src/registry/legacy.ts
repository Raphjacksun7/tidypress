import type { DocsMintCollectionKind, DocsMintSections } from '../schema/index.js'

export const starterCollectionKeys = ['docs', 'writing', 'pages'] as const
export type StarterCollectionKey = (typeof starterCollectionKeys)[number]

export const legacySectionKeys = ['docs', 'writing'] as const
export type LegacySectionKey = (typeof legacySectionKeys)[number]

/** Built-in homepage preview order (writing before docs). */
export const defaultHomePreviewSectionKeys = ['writing', 'docs'] as const
export type DefaultHomePreviewSectionKey = (typeof defaultHomePreviewSectionKeys)[number]

const starterCollectionKindByKey: Partial<Record<StarterCollectionKey, DocsMintCollectionKind>> = {
  writing: 'writing',
  pages: 'page',
}

export function isStarterCollectionKey(key: string): key is StarterCollectionKey {
  return (starterCollectionKeys as readonly string[]).includes(key)
}

export function isDocsCollectionKey(key: string): boolean {
  return key === 'docs'
}

/** @deprecated Reserved kind name — use `content` for reference-style collections. */
export function isReservedDocsKind(kind: string | undefined): boolean {
  return kind === 'docs'
}

export function inferStarterCollectionKind(key: string): DocsMintCollectionKind | undefined {
  if (isDocsCollectionKey(key)) {
    return undefined
  }
  return starterCollectionKindByKey[key as StarterCollectionKey]
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

/** @deprecated Use isDocsCollectionKey */
export function isDocsStarterKey(key: string): boolean {
  return isDocsCollectionKey(key)
}
