import { defaultConfig } from './defaults.js'
import type {
  CustomPageExtension,
  DocsMintConfig,
  DocsMintExtensions,
  FooterItem,
  NavItem,
} from './schema.js'

export type { CustomPageExtension, DocsMintConfig, DocsMintExtensions, FooterItem, NavItem }

export function defineConfig(config: DocsMintConfig): DocsMintConfig {
  return config
}

const customPageSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const reservedCustomPageSlugs = new Set(['docs', 'writing', 'pagefind', '_astro', '404', 'index'])

function validateCustomPages(customPages: CustomPageExtension[]): CustomPageExtension[] {
  const seen = new Set()
  for (const page of customPages) {
    if (!customPageSlugPattern.test(page.slug)) {
      throw new Error(
        `Invalid extension custom page slug "${page.slug}". Use kebab-case (e.g. "about").`,
      )
    }
    if (reservedCustomPageSlugs.has(page.slug)) {
      throw new Error(`Extension custom page slug "${page.slug}" is reserved.`)
    }
    if (seen.has(page.slug)) {
      throw new Error(`Duplicate extension custom page slug "${page.slug}".`)
    }
    seen.add(page.slug)
  }
  return customPages
}

function applyExtensionNav(
  nav: NavItem[] | undefined,
  customPages: CustomPageExtension[],
): NavItem[] | undefined {
  if (!nav) {
    return nav
  }

  const entries = [...nav]
  const existingHrefs = new Set(entries.map(item => item.href))
  for (const page of customPages) {
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
  const customPages = validateCustomPages(config.extensions?.customPages ?? [])
  const navPolicy = validateNavPolicy(config)
  const navWithExtensions = applyExtensionNav(config.nav ?? defaultConfig.nav, customPages)
  const nav = normalizeNavItems(navWithExtensions)
  validateCoreItemBudget(nav, navPolicy)

  return {
    ...defaultConfig,
    ...config,
    nav,
    footer: config.footer ?? defaultConfig.footer,
    navPolicy,
    extensions: {
      customPages,
    },
  }
}
