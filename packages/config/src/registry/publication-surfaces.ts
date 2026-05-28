import type { TidyPressCollectionKind } from './collection-kinds.js'

/**
 * Canonical keys for the `body-of-work` init preset (personal/public work).
 * Product documentation uses the separate `docs` collection — see preset `docs-writing`.
 */
export const publicationSurfaceKeys = [
  'works',
  'projects',
  'writing',
  'reference',
  'process',
  'pages',
] as const

export type PublicationSurfaceKey = (typeof publicationSurfaceKeys)[number]

export type PublicationSurfaceKind = TidyPressCollectionKind

export interface PublicationSurfaceDefinition {
  readonly key: PublicationSurfaceKey
  readonly kind: PublicationSurfaceKind
  readonly onHome: boolean
  readonly homeLayout?: 'list' | 'card'
  readonly homeShowDate?: boolean
  /** Nav label; defaults to `key`. */
  readonly navLabel?: string
  /** Nav href; defaults to `/${key}` or page route when `pageSlug` is set. */
  readonly navHref?: string
  /** Top header nav; defaults true. `pages` uses `pages` config instead. */
  readonly primaryNav?: boolean
  /** Footer sub-nav link when not in primary nav. */
  readonly footerLink?: boolean
  /** For `pages` — standalone page slug (e.g. about → `/about`). */
  readonly pageSlug?: string
  readonly pageNavLabel?: string
}

export const publicationSurfaceDefinitions = [
  {
    key: 'works',
    kind: 'projects',
    onHome: true,
    homeLayout: 'card',
    primaryNav: true,
  },
  {
    key: 'projects',
    kind: 'projects',
    onHome: true,
    homeLayout: 'card',
    primaryNav: true,
  },
  {
    key: 'writing',
    kind: 'writing',
    onHome: true,
    homeLayout: 'list',
    homeShowDate: true,
    primaryNav: true,
  },
  {
    key: 'reference',
    kind: 'content',
    onHome: false,
    primaryNav: false,
    footerLink: true,
  },
  {
    key: 'process',
    kind: 'content',
    onHome: false,
    primaryNav: false,
    footerLink: true,
  },
  {
    key: 'pages',
    kind: 'page',
    onHome: false,
    pageSlug: 'about',
    pageNavLabel: 'about',
    primaryNav: false,
  },
] as const satisfies readonly PublicationSurfaceDefinition[]

export function isPublicationSurfaceKey(key: string): key is PublicationSurfaceKey {
  return (publicationSurfaceKeys as readonly string[]).includes(key)
}

export function collectionBasePath(key: string): string {
  return `/${key}`
}

export function publicationSurfaceBasePath(key: PublicationSurfaceKey): string {
  return collectionBasePath(key)
}

export function publicationSurfaceNavHref(surface: PublicationSurfaceDefinition): string {
  if (surface.pageSlug) {
    return `/${surface.pageSlug}`
  }
  return surface.navHref ?? publicationSurfaceBasePath(surface.key)
}

export function publicationSurfaceNavLabel(surface: PublicationSurfaceDefinition): string {
  return surface.navLabel ?? surface.pageNavLabel ?? surface.key
}

export function publicationSurfaceHomeOrder(): PublicationSurfaceKey[] {
  return publicationSurfaceDefinitions.filter(surface => surface.onHome).map(surface => surface.key)
}

export function publicationSurfacePrimaryNavDefinitions(): PublicationSurfaceDefinition[] {
  return publicationSurfaceDefinitions.filter(
    surface => surface.key !== 'pages' && surface.primaryNav !== false,
  )
}

export function publicationSurfaceFooterNavItems(): Array<{ label: string; href: string }> {
  return publicationSurfaceDefinitions
    .filter(surface => 'footerLink' in surface && surface.footerLink)
    .map(surface => ({
      label: publicationSurfaceNavLabel(surface),
      href: publicationSurfaceNavHref(surface),
    }))
}

export function publicationSurfaceHomeCollections(): Record<
  string,
  { layout: 'list' | 'card'; showDescription?: boolean; showDate?: boolean }
> {
  const collections: Record<string, { layout: 'list' | 'card'; showDescription?: boolean; showDate?: boolean }> =
    {}
  for (const surface of publicationSurfaceDefinitions) {
    if (!surface.onHome || !surface.homeLayout) {
      continue
    }
    const entry: { layout: 'list' | 'card'; showDescription?: boolean; showDate?: boolean } = {
      layout: surface.homeLayout,
    }
    if (surface.homeLayout === 'card') {
      entry.showDescription = true
    }
    if ('homeShowDate' in surface && surface.homeShowDate) {
      entry.showDate = true
    }
    collections[surface.key] = entry
  }
  return collections
}

export function publicationSurfaceUsesProjectsKind(surface: PublicationSurfaceDefinition): boolean {
  return surface.kind === 'projects'
}

export function resolveSurfaceCollectionKind(key: PublicationSurfaceKey): TidyPressCollectionKind {
  const surface = publicationSurfaceDefinitions.find(entry => entry.key === key)
  if (!surface) {
    throw new Error(`Unknown publication surface key: ${key}`)
  }
  return surface.kind
}
