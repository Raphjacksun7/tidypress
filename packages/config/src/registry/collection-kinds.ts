export type CollectionRouteViewMode = 'collection-index' | 'collection-entry' | 'version-root'

export type CollectionShellLayout = 'docs' | 'writing' | 'page'

type CollectionKindRouteModeConfig = {
  readonly requiresRenderedEntry: boolean
}

/** Single registry for user-selectable collection kinds (not the `docs` collection key). */
export const docsMintCollectionKindRegistry = {
  content: {
    contentSchema: 'docs',
    usesDocsSidebar: true,
    shellLayout: 'docs',
    routeModes: {
      'collection-index': { requiresRenderedEntry: false },
      'collection-entry': { requiresRenderedEntry: true },
      'version-root': { requiresRenderedEntry: true },
    },
  },
  writing: {
    contentSchema: 'writing',
    usesDocsSidebar: false,
    shellLayout: 'writing',
    routeModes: {
      'collection-index': { requiresRenderedEntry: false },
      'collection-entry': { requiresRenderedEntry: true },
    },
  },
  page: {
    contentSchema: 'page',
    usesDocsSidebar: false,
    shellLayout: 'page',
    routeModes: {
      'collection-index': { requiresRenderedEntry: false },
      'collection-entry': { requiresRenderedEntry: true },
    },
  },
  projects: {
    contentSchema: 'projects',
    usesDocsSidebar: false,
    shellLayout: 'writing',
    routeModes: {
      'collection-index': { requiresRenderedEntry: false },
      'collection-entry': { requiresRenderedEntry: true },
    },
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

/** Collections indexed by Pagefind and listed in search filter chips (excludes standalone pages). */
export function isSearchableCollectionKind(kind: DocsMintCollectionKind | undefined): boolean {
  return !kind || !isPageCollectionKind(kind)
}

export function isPageCollectionKind(kind: DocsMintCollectionKind): boolean {
  return kind === 'page'
}

export const defaultCollectionKind: DocsMintCollectionKind = 'content'

export function resolveCollectionKind(kind: string | undefined): DocsMintCollectionKind {
  return kind && isDocsMintCollectionKind(kind) ? kind : defaultCollectionKind
}

export function collectionKindShellLayout(kind: DocsMintCollectionKind): CollectionShellLayout {
  return docsMintCollectionKindRegistry[kind].shellLayout
}

export function collectionKindRouteModes(kind: DocsMintCollectionKind): CollectionRouteViewMode[] {
  return Object.keys(docsMintCollectionKindRegistry[kind].routeModes) as CollectionRouteViewMode[]
}

export function collectionKindModeRequiresRenderedEntry(
  kind: DocsMintCollectionKind,
  mode: CollectionRouteViewMode,
): boolean {
  const entry =
    docsMintCollectionKindRegistry[kind].routeModes[
      mode as keyof (typeof docsMintCollectionKindRegistry)[typeof kind]['routeModes']
    ]
  if (!entry) {
    throw new Error(`Collection kind "${kind}" does not support route mode "${mode}".`)
  }
  return entry.requiresRenderedEntry
}

/** Custom doc forms use the docs shell and full route surface. */
export const docsMintDocFormViewConfig = {
  shellLayout: 'docs' as const satisfies CollectionShellLayout,
  routeModes: {
    'collection-index': { requiresRenderedEntry: true },
    'collection-entry': { requiresRenderedEntry: true },
    'version-root': { requiresRenderedEntry: true },
  } as const satisfies Record<CollectionRouteViewMode, CollectionKindRouteModeConfig>,
}
