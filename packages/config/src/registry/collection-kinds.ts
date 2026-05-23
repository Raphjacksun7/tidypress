/** Single registry for user-selectable collection kinds (not the `docs` collection key). */
export const docsMintCollectionKindRegistry = {
  content: {
    contentSchema: 'docs',
    usesDocsSidebar: true,
  },
  writing: {
    contentSchema: 'writing',
    usesDocsSidebar: false,
  },
  page: {
    contentSchema: 'page',
    usesDocsSidebar: false,
  },
} as const

export type DocsMintCollectionKind = keyof typeof docsMintCollectionKindRegistry

export const docsMintCollectionKinds = Object.keys(
  docsMintCollectionKindRegistry,
) as DocsMintCollectionKind[]

export type DocsMintCollectionContentSchema =
  (typeof docsMintCollectionKindRegistry)[DocsMintCollectionKind]['contentSchema']

export function isDocsMintCollectionKind(value: string | undefined): value is DocsMintCollectionKind {
  return value !== undefined && value in docsMintCollectionKindRegistry
}

export function formatDocsMintCollectionKinds(): string {
  return docsMintCollectionKinds.map(kind => `"${kind}"`).join(', ')
}

export function collectionKindUsesDocsSidebar(kind: DocsMintCollectionKind): boolean {
  return docsMintCollectionKindRegistry[kind].usesDocsSidebar
}

export function collectionKindContentSchema(kind: DocsMintCollectionKind): DocsMintCollectionContentSchema {
  return docsMintCollectionKindRegistry[kind].contentSchema
}

export function isPageCollectionKind(kind: DocsMintCollectionKind): boolean {
  return kind === 'page'
}
