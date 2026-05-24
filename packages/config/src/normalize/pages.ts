import type { DocsMintConfig, PageEntry, PageEntryObject } from '../schema/index.js'
import type { NavItem } from '../schema/index.js'

const pageSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const reservedPageSlugs = new Set(['docs', 'writing', 'pagefind', 'assets', '404', 'index'])

export interface NormalizedPageEntry {
  slug: string
  navLabel?: string
}

function legacyCustomPages(config: DocsMintConfig): PageEntry[] {
  const legacy = (config as DocsMintConfig & { extensions?: { customPages?: PageEntryObject[] } }).extensions
    ?.customPages
  return legacy ?? []
}

export function normalizePages(pageEntries: PageEntry[]): NormalizedPageEntry[] {
  const seen = new Set<string>()
  const normalized = pageEntries.map(entry => {
    if (typeof entry === 'string') {
      return { slug: entry }
    }
    return entry
  })

  for (const page of normalized) {
    if (!pageSlugPattern.test(page.slug)) {
      throw new Error(
        `Invalid custom page slug "${page.slug}". Use kebab-case (e.g. "about").`,
      )
    }
    if (reservedPageSlugs.has(page.slug)) {
      throw new Error(`Custom page slug "${page.slug}" is reserved.`)
    }
    if (seen.has(page.slug)) {
      throw new Error(`Duplicate custom page slug "${page.slug}".`)
    }
    seen.add(page.slug)
  }
  return normalized
}

export function collectPageEntries(config: DocsMintConfig): NormalizedPageEntry[] {
  return normalizePages([...(config.pages ?? []), ...legacyCustomPages(config)])
}

export function applyPagesNav(
  nav: NavItem[] | undefined,
  pages: NormalizedPageEntry[],
): NavItem[] | undefined {
  if (!nav) {
    return nav
  }

  const entries = [...nav]
  const existingHrefs = new Set(entries.map(item => item.href))
  for (const page of pages) {
    if (!page.navLabel) {
      continue
    }
    const href = `/${page.slug}`
    if (existingHrefs.has(href)) {
      continue
    }
    entries.push({ label: page.navLabel, href })
    existingHrefs.add(href)
  }
  return entries
}
