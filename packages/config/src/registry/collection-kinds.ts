export type CollectionRouteViewMode = 'collection-index' | 'collection-entry' | 'version-root'

export type CollectionShellLayout = 'docs' | 'writing' | 'page'

type CollectionKindRouteModeConfig = {
  readonly requiresRenderedEntry: boolean
}

/** Single registry for user-selectable collection kinds (not the `docs` collection key). */
export const tidyPressCollectionKindRegistry = {
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

export type TidyPressCollectionKind = keyof typeof tidyPressCollectionKindRegistry

export const tidyPressCollectionKinds = Object.keys(
  tidyPressCollectionKindRegistry,
) as TidyPressCollectionKind[]

export type TidyPressCollectionContentSchema =
  (typeof tidyPressCollectionKindRegistry)[TidyPressCollectionKind]['contentSchema']

export function isTidyPressCollectionKind(value: string | undefined): value is TidyPressCollectionKind {
  return value !== undefined && value in tidyPressCollectionKindRegistry
}

export function formatTidyPressCollectionKinds(): string {
  return tidyPressCollectionKinds.map(kind => `"${kind}"`).join(', ')
}

export function collectionKindUsesDocsSidebar(kind: TidyPressCollectionKind): boolean {
  return tidyPressCollectionKindRegistry[kind].usesDocsSidebar
}

export function collectionKindContentSchema(kind: TidyPressCollectionKind): TidyPressCollectionContentSchema {
  return tidyPressCollectionKindRegistry[kind].contentSchema
}

/** Collections indexed by Pagefind and listed in search filter chips (excludes standalone pages). */
export function isSearchableCollectionKind(kind: TidyPressCollectionKind | undefined): boolean {
  return !kind || !isPageCollectionKind(kind)
}

export function isPageCollectionKind(kind: TidyPressCollectionKind): boolean {
  return kind === 'page'
}

export const defaultCollectionKind: TidyPressCollectionKind = 'content'

export function resolveCollectionKind(kind: string | undefined): TidyPressCollectionKind {
  return kind && isTidyPressCollectionKind(kind) ? kind : defaultCollectionKind
}

export function collectionKindShellLayout(kind: TidyPressCollectionKind): CollectionShellLayout {
  return tidyPressCollectionKindRegistry[kind].shellLayout
}

export function collectionKindRouteModes(kind: TidyPressCollectionKind): CollectionRouteViewMode[] {
  return Object.keys(tidyPressCollectionKindRegistry[kind].routeModes) as CollectionRouteViewMode[]
}

export function collectionKindModeRequiresRenderedEntry(
  kind: TidyPressCollectionKind,
  mode: CollectionRouteViewMode,
): boolean {
  const entry =
    tidyPressCollectionKindRegistry[kind].routeModes[
      mode as keyof (typeof tidyPressCollectionKindRegistry)[typeof kind]['routeModes']
    ]
  if (!entry) {
    throw new Error(`Collection kind "${kind}" does not support route mode "${mode}".`)
  }
  return entry.requiresRenderedEntry
}

/** Custom doc forms use the docs shell and full route surface. */
export const tidyPressDocFormViewConfig = {
  shellLayout: 'docs' as const satisfies CollectionShellLayout,
  routeModes: {
    'collection-index': { requiresRenderedEntry: true },
    'collection-entry': { requiresRenderedEntry: true },
    'version-root': { requiresRenderedEntry: true },
  } as const satisfies Record<CollectionRouteViewMode, CollectionKindRouteModeConfig>,
}
