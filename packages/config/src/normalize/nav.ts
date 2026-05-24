import { defaultConfig } from '../defaults.js'
import { ensureBlankTargetRel, isExternalHref } from '../links/link-attributes.js'
import { isPageCollectionKind } from '../registry/collection-kinds.js'
import type { DocsMintCollections, DocsMintConfig, NavItem } from '../schema/index.js'

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

export function normalizeNavItems(nav: NavItem[] | undefined): NavItem[] | undefined {
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

export function validateNavPolicy(config: DocsMintConfig): DocsMintConfig['navPolicy'] {
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

export function buildSectionDefaultNav(collections: DocsMintCollections): NavItem[] {
  return Object.entries(collections)
    .filter(
      ([, collection]) =>
        collection?.enabled && (!collection.kind || !isPageCollectionKind(collection.kind)),
    )
    .map(([key, collection]) => ({
      label: collection.label ?? key,
      href: collection.basePath ?? `/${key}`,
    }))
}

export function filterDisabledSectionNav(
  nav: NavItem[] | undefined,
  collections: DocsMintCollections,
): NavItem[] | undefined {
  if (!nav) {
    return nav
  }
  const disabledBasePaths = new Set(
    Object.values(collections)
      .filter(collection => collection && collection.enabled === false && collection.basePath)
      .map(collection => collection.basePath as string),
  )
  return nav.filter(item => !disabledBasePaths.has(item.href))
}

export function validateCoreItemBudget(
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
