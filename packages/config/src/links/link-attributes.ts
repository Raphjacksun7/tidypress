export const LINK_TARGET_BLANK = '_blank' as const
export const LINK_REL_BLANK = 'noopener noreferrer' as const

export interface ResolvedLinkAttributes {
  target?: typeof LINK_TARGET_BLANK
  rel?: typeof LINK_REL_BLANK
}

export function isExternalHref(href: string): boolean {
  return /^(https?:)?\/\//.test(href) || href.startsWith('mailto:') || href.startsWith('tel:')
}

function normalizeRel(rel: string | undefined): string | undefined {
  if (!rel) {
    return rel
  }
  const parts = rel
    .split(/\s+/)
    .map(part => part.trim())
    .filter(Boolean)
  return Array.from(new Set(parts)).join(' ')
}

export function ensureBlankTargetRel(rel: string | undefined): typeof LINK_REL_BLANK {
  const normalized = normalizeRel(rel)
  const parts = new Set((normalized ?? '').split(/\s+/).filter(Boolean))
  parts.add('noopener')
  parts.add('noreferrer')
  return Array.from(parts).join(' ') as typeof LINK_REL_BLANK
}

export function resolveNewTabLinkAttributes(openInNewTab: boolean): ResolvedLinkAttributes {
  if (!openInNewTab) {
    return {}
  }
  return {
    target: LINK_TARGET_BLANK,
    rel: LINK_REL_BLANK,
  }
}

/** Static spread props for links that always open in a new tab (e.g. repository edit). */
export const LINK_NEW_TAB_ATTRIBUTES: ResolvedLinkAttributes = resolveNewTabLinkAttributes(true)

export function resolveEntryLinkAttributes(entry: {
  external?: boolean
}): ResolvedLinkAttributes {
  return resolveNewTabLinkAttributes(entry.external === true)
}

export function resolveHeroLinkAttributes(link: {
  external?: boolean
}): ResolvedLinkAttributes {
  if (link.external === false) {
    return {}
  }
  return resolveNewTabLinkAttributes(true)
}
