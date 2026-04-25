import { defaultConfig } from './defaults.js'
import type {
  DocsMintBranding,
  DocsMintConfig,
  DocsMintSearch,
  DocsMintSections,
  DocsMintTypography,
  FooterItem,
  NavItem,
  PageEntry,
  PageEntryObject,
} from './schema.js'

export type { DocsMintBranding, DocsMintConfig, DocsMintSearch, DocsMintSections, FooterItem, NavItem, PageEntry }

export function defineConfig(config: DocsMintConfig): DocsMintConfig {
  return config
}

const pageSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const reservedPageSlugs = new Set(['docs', 'writing', 'pagefind', '_astro', '404', 'index'])

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
  const seen = new Set()
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

function applyPagesNav(
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

function isExternalHref(href: string): boolean {
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

function ensureBlankTargetRel(rel: string | undefined): string {
  const normalized = normalizeRel(rel)
  const parts = new Set((normalized ?? '').split(/\s+/).filter(Boolean))
  parts.add('noopener')
  parts.add('noreferrer')
  return Array.from(parts).join(' ')
}

function normalizeNavItems(nav: NavItem[] | undefined): NavItem[] | undefined {
  if (!nav) {
    return nav
  }
  return nav.map(item => {
    const external = item.external ?? isExternalHref(item.href)
    const target = item.target ?? (external ? '_self' : undefined)
    const rel = target === '_blank' ? ensureBlankTargetRel(item.rel) : normalizeRel(item.rel)
    return {
      ...item,
      external,
      target,
      rel: rel || undefined,
      priority: item.priority ?? 'secondary',
    }
  })
}

function validateNavPolicy(config: DocsMintConfig): DocsMintConfig['navPolicy'] {
  const policy = {
    ...defaultConfig.navPolicy,
    ...config.navPolicy,
  }

  if (!policy) {
    return undefined
  }

  if (!policy.maxVisibleDesktop || policy.maxVisibleDesktop < 1) {
    throw new Error('navPolicy.maxVisibleDesktop must be >= 1.')
  }
  if (!policy.maxVisibleMobile || policy.maxVisibleMobile < 1) {
    throw new Error('navPolicy.maxVisibleMobile must be >= 1.')
  }
  return policy
}

function normalizeSections(config: DocsMintConfig): DocsMintSections {
  const defaults = defaultConfig.sections ?? {}
  const sections = config.sections ?? {}
  const normalized = {
    docs: {
      ...defaults.docs,
      ...(sections.docs ?? {}),
    },
    writing: {
      ...defaults.writing,
      ...(sections.writing ?? {}),
    },
  }

  if (normalized.docs?.basePath && normalized.docs.basePath !== '/docs') {
    throw new Error('sections.docs.basePath currently supports only "/docs".')
  }
  if (normalized.writing?.basePath && normalized.writing.basePath !== '/writing') {
    throw new Error('sections.writing.basePath currently supports only "/writing".')
  }

  return normalized
}

function buildSectionDefaultNav(sections: DocsMintSections): NavItem[] {
  const nav: NavItem[] = []
  if (sections.docs?.enabled) {
    nav.push({ label: 'docs', href: sections.docs.basePath ?? '/docs' })
  }
  if (sections.writing?.enabled) {
    nav.push({ label: 'writing', href: sections.writing.basePath ?? '/writing' })
  }
  return nav
}

function filterDisabledSectionNav(nav: NavItem[] | undefined, sections: DocsMintSections): NavItem[] | undefined {
  if (!nav) {
    return nav
  }
  const docsBasePath = sections.docs?.basePath ?? '/docs'
  const writingBasePath = sections.writing?.basePath ?? '/writing'
  return nav.filter(item => {
    if (item.href === docsBasePath && !sections.docs?.enabled) {
      return false
    }
    if (item.href === writingBasePath && !sections.writing?.enabled) {
      return false
    }
    return true
  })
}

function normalizeSearch(config: DocsMintConfig): DocsMintSearch {
  return {
    ...defaultConfig.search,
    ...(config.search ?? {}),
    exclude: config.search?.exclude ?? defaultConfig.search?.exclude ?? [],
  }
}

function normalizeTypography(config: DocsMintConfig): DocsMintTypography {
  const defaults = defaultConfig.typography ?? { scale: 'default' }
  const typography = {
    ...defaults,
    ...(config.typography ?? {}),
  }

  if (typography.scale === 'extra') {
    typography.scale = 'large'
  }

  const allowed = new Set(['default', 'medium', 'large'])
  if (!allowed.has(typography.scale ?? 'default')) {
    throw new Error('typography.scale must be one of: "default", "medium", "large".')
  }

  return typography
}

function validateCoreItemBudget(
  nav: NavItem[] | undefined,
  navPolicy: DocsMintConfig['navPolicy'],
): void {
  if (!nav || !navPolicy || navPolicy.mode !== 'strict') {
    return
  }
  const coreItems = nav.filter(item => item.priority === 'core')
  if (coreItems.length > (navPolicy.maxVisibleDesktop ?? 3)) {
    throw new Error(
      `Too many core nav items (${coreItems.length}). Reduce to ${navPolicy.maxVisibleDesktop} or fewer.`,
    )
  }
}

function pickVisible(nav: NavItem[], limit: number): { visible: NavItem[]; overflow: NavItem[] } {
  const core = nav.filter(item => item.priority === 'core')
  const secondary = nav.filter(item => item.priority !== 'core')
  const selected = new Set<NavItem>()

  for (const item of core) {
    if (selected.size >= limit) {
      break
    }
    selected.add(item)
  }
  for (const item of secondary) {
    if (selected.size >= limit) {
      break
    }
    selected.add(item)
  }

  const visible = nav.filter(item => selected.has(item))
  const overflow = nav.filter(item => !selected.has(item))
  return { visible, overflow }
}

export function buildNavigationModel(config: DocsMintConfig): {
  desktop: { visible: NavItem[]; overflow: NavItem[] }
  mobile: { visible: NavItem[]; overflow: NavItem[] }
} {
  const safeConfig = withDefaults(config)
  const nav = safeConfig.nav ?? []
  const navPolicy = safeConfig.navPolicy ?? defaultConfig.navPolicy
  const desktopLimit = navPolicy?.maxVisibleDesktop ?? 3
  const mobileLimit = navPolicy?.maxVisibleMobile ?? 2
  return {
    desktop: pickVisible(nav, desktopLimit),
    mobile: pickVisible(nav, mobileLimit),
  }
}

export function withDefaults(config: DocsMintConfig): DocsMintConfig {
  const pages = normalizePages([...(config.pages ?? []), ...legacyCustomPages(config)])
  const sections = normalizeSections(config)
  const navPolicy = validateNavPolicy(config)
  const sourceNav = config.nav ?? buildSectionDefaultNav(sections)
  const navWithExtensions = applyPagesNav(sourceNav, pages)
  const filteredNav = filterDisabledSectionNav(navWithExtensions, sections)
  const nav = normalizeNavItems(filteredNav)
  const search = normalizeSearch(config)
  const typography = normalizeTypography(config)
  validateCoreItemBudget(nav, navPolicy)

  return {
    ...defaultConfig,
    ...config,
    writing: {
      ...defaultConfig.writing,
      ...config.writing,
    },
    nav,
    footer: config.footer ?? defaultConfig.footer,
    repository: {
      ...defaultConfig.repository,
      ...config.repository,
    },
    search,
    typography,
    branding: config.branding ? { ...config.branding } : undefined,
    sections,
    navPolicy,
    pages,
  }
}
