import { defaultConfig } from './defaults.js'
import {
  getLegacySectionForCollection,
  inferStarterCollectionKind,
  isLegacySectionKey,
  starterCollectionKeys,
} from './legacy.js'
import { migrateSectionsToCollections } from './migration.js'
import { normalizeCapabilities, resolveCapabilityFlags } from './capabilities.js'
import type {
  DocsMintBranding,
  DocsMintCapabilities,
  DocsMintCapabilityName,
  DocsMintCollectionKind,
  DocsMintCollections,
  DocsMintConfig,
  DocsMintI18n,
  DocsMintI18nStrings,
  DocsMintSearch,
  DocsMintSections,
  DocsMintTheme,
  DocsMintThemeMode,
  DocsMintThemePreset,
  DocsMintThemeTokenSurface,
  DocsMintThemeTokenName,
  DocsMintVersion,
  DocsMintTypography,
  FooterItem,
  NavItem,
  PageEntry,
  PageEntryObject,
} from './schema.js'

export type {
  DocsMintBranding,
  DocsMintCapabilities,
  DocsMintCapabilityName,
  DocsMintCollectionKind,
  DocsMintCollections,
  DocsMintConfig,
  DocsMintI18n,
  DocsMintI18nStrings,
  DocsMintSearch,
  DocsMintSections,
  DocsMintTheme,
  DocsMintThemeMode,
  DocsMintThemePreset,
  DocsMintThemeTokenSurface,
  DocsMintThemeTokenName,
  DocsMintVersion,
  FooterItem,
  NavItem,
  PageEntry,
}
export {
  capabilityRegistry,
  isCapabilityEnabled,
  normalizeCapabilities,
  resolveCapabilities,
  resolveCapabilityFlags,
  type DocsMintCapabilityDescriptor,
  type DocsMintCapabilityKey,
  type ResolveCapabilitiesOptions,
  type ResolvedCapabilityFlags,
  type ResolvedCapabilityMap,
  type ResolvedCapabilityState,
} from './capabilities.js'
export {
  migrateSectionsToCollections,
  type SectionsMigrationOptions,
  type SectionsMigrationResult,
} from './migration.js'
export {
  isStarterCollectionKey,
  starterCollectionKeys,
  isLegacySectionKey,
  legacySectionKeys,
  inferStarterCollectionKind,
} from './legacy.js'

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

function inferCollectionKind(key: string): DocsMintCollectionKind {
  return inferStarterCollectionKind(key)
}

function normalizeCollections(config: DocsMintConfig): DocsMintCollections {
  const defaults = defaultConfig.collections ?? {}
  const collections = config.collections ?? {}
  const sections = config.sections ?? {}
  const normalized: DocsMintCollections = {}
  const keys = new Set<string>([
    ...Object.keys(defaults),
    ...Object.keys(collections),
    ...starterCollectionKeys,
  ])

  for (const key of keys) {
    const preset = defaults[key] ?? {}
    const configured = collections[key] ?? {}
    const legacySection = getLegacySectionForCollection(sections, key)
    const shouldApplySectionShim = isLegacySectionKey(key) && !collections[key]
    normalized[key] = {
      ...preset,
      ...configured,
      ...(shouldApplySectionShim ? legacySection : {}),
      kind: configured.kind ?? preset.kind ?? inferCollectionKind(key),
    }
  }

  for (const [key, collection] of Object.entries(normalized)) {
    const basePath = collection?.basePath
    if (!basePath) {
      continue
    }
    if (!basePath.startsWith('/') || basePath.includes(' ')) {
      throw new Error(`collections.${key}.basePath must be an absolute path like "/docs".`)
    }
    if (basePath.length > 1 && basePath.endsWith('/')) {
      throw new Error(`collections.${key}.basePath must not end with "/" (got "${basePath}").`)
    }
  }

  const usedBasePaths = new Map<string, string>()
  for (const [key, collection] of Object.entries(normalized)) {
    if (!collection?.enabled || !collection.basePath) {
      continue
    }
    const conflict = usedBasePaths.get(collection.basePath)
    if (conflict) {
      throw new Error(`collections.${key}.basePath conflicts with collections.${conflict}.basePath "${collection.basePath}".`)
    }
    usedBasePaths.set(collection.basePath, key)
  }

  return normalized
}

function deriveSectionsFromCollections(collections: DocsMintCollections): DocsMintSections {
  const docs = collections.docs
  const writing = collections.writing
  return {
    docs: {
      enabled: docs?.enabled,
      basePath: docs?.basePath,
    },
    writing: {
      enabled: writing?.enabled,
      basePath: writing?.basePath,
    },
  }
}

function applyStarterCapabilityOverrides(
  collections: DocsMintCollections,
  flags: Partial<Record<DocsMintCapabilityName, boolean>>,
): DocsMintCollections {
  const next = { ...collections }
  for (const key of ['docs', 'writing', 'pages'] as const) {
    if (!next[key]) {
      continue
    }
    next[key] = {
      ...next[key],
      enabled: flags[key] ?? next[key].enabled,
    }
  }
  return next
}

function buildSectionDefaultNav(collections: DocsMintCollections): NavItem[] {
  return Object.entries(collections)
    .filter(([, collection]) => collection?.enabled && collection.kind !== 'page')
    .map(([key, collection]) => ({
      label: collection.label ?? key,
      href: collection.basePath ?? `/${key}`,
    }))
}

function filterDisabledSectionNav(
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
  return nav.filter(item => {
    if (disabledBasePaths.has(item.href)) {
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

const allowedThemeTokens = new Set<DocsMintThemeTokenName>([
  'bg',
  'fg',
  'muted',
  'border',
  'surface',
  'codeBg',
  'codeFg',
])

function normalizeTheme(
  config: DocsMintConfig,
  capabilityFlags: Partial<Record<DocsMintCapabilityName, boolean>>,
): DocsMintTheme {
  const fallback = structuredClone(defaultConfig.theme ?? {
    mode: 'guardrailed',
    preset: 'baseline',
    tokens: { light: {}, dark: {} },
  })
  const source = config.theme ?? {}
  const mode = source.mode ?? fallback.mode ?? 'guardrailed'
  const preset = source.preset ?? fallback.preset ?? 'baseline'
  if (preset !== 'baseline') {
    throw new Error('theme.preset must be "baseline".')
  }
  if (mode !== 'guardrailed' && mode !== 'custom') {
    throw new Error('theme.mode must be "guardrailed" or "custom".')
  }

  if (capabilityFlags.theming === false) {
    return {
      mode: 'guardrailed',
      preset: 'baseline',
      tokens: fallback.tokens,
    }
  }

  const defaultLight = fallback.tokens?.light ?? {}
  const defaultDark = fallback.tokens?.dark ?? {}
  const customTokens = source.tokens

  if (mode === 'guardrailed') {
    return {
      mode,
      preset,
      tokens: {
        light: defaultLight,
        dark: defaultDark,
      },
    }
  }

  if (capabilityFlags.themingCustom !== true) {
    throw new Error(
      'theme.mode="custom" requires capabilities.enable to include "themingCustom".',
    )
  }
  if (!customTokens || !customTokens.light || !customTokens.dark) {
    throw new Error('theme.mode="custom" requires theme.tokens.light and theme.tokens.dark.')
  }

  const normalizeTokenMap = (
    tokenMap: Partial<DocsMintThemeTokenSurface>,
    field: 'theme.tokens.light' | 'theme.tokens.dark',
  ): Partial<DocsMintThemeTokenSurface> => {
    const normalized: Partial<DocsMintThemeTokenSurface> = {}
    for (const [key, rawValue] of Object.entries(tokenMap)) {
      if (!allowedThemeTokens.has(key as DocsMintThemeTokenName)) {
        throw new Error(
          `${field} contains unsupported token "${key}". Allowed tokens: ${Array.from(allowedThemeTokens).join(', ')}.`,
        )
      }
      const value = String(rawValue ?? '').trim()
      if (!value) {
        throw new Error(`${field}.${key} must be a non-empty string.`)
      }
      if (!/^[#(),.%/\-\sA-Za-z0-9]+$/.test(value)) {
        throw new Error(`${field}.${key} contains unsupported characters for a CSS token.`)
      }
      normalized[key as DocsMintThemeTokenName] = value
    }
    if (Object.keys(normalized).length === 0) {
      throw new Error(`${field} must include at least one token override.`)
    }
    return normalized
  }

  return {
    mode,
    preset,
    tokens: {
      light: {
        ...defaultLight,
        ...normalizeTokenMap(customTokens.light, 'theme.tokens.light'),
      },
      dark: {
        ...defaultDark,
        ...normalizeTokenMap(customTokens.dark, 'theme.tokens.dark'),
      },
    },
  }
}

function normalizeI18n(config: DocsMintConfig): DocsMintI18n | undefined {
  if (!config.i18n) {
    return undefined
  }

  const rawLocales = config.i18n.locales ?? []
  const locales = Array.from(new Set(rawLocales.map(locale => locale.trim()).filter(Boolean)))
  const defaultLocale = (config.i18n.defaultLocale ?? locales[0] ?? 'en').trim()
  if (!defaultLocale) {
    throw new Error('i18n.defaultLocale must not be empty.')
  }
  if (locales.length > 0 && !locales.includes(defaultLocale)) {
    throw new Error(`i18n.defaultLocale "${defaultLocale}" must be present in i18n.locales.`)
  }

  const normalizedLocales = locales.length > 0 ? locales : [defaultLocale]
  const strings = Object.entries(config.i18n.strings ?? {}).reduce<Record<string, DocsMintI18nStrings>>(
    (acc, [locale, value]) => {
      if (!value) {
        return acc
      }
      acc[locale] = { ...value }
      return acc
    },
    {},
  )

  return {
    ...config.i18n,
    defaultLocale,
    locales: normalizedLocales,
    strings: Object.keys(strings).length > 0 ? strings : undefined,
  }
}

function normalizeVersions(config: DocsMintConfig, collections: DocsMintCollections): DocsMintVersion[] | undefined {
  const versions = config.versions
  if (!versions || versions.length === 0) {
    return undefined
  }

  const docsBasePath = collections.docs?.basePath ?? '/docs'
  if (!collections.docs?.enabled) {
    throw new Error('versions requires collections.docs.enabled=true.')
  }

  const normalizedBasePath = docsBasePath === '/' ? '' : docsBasePath
  const seenLabels = new Set<string>()
  const seenPaths = new Set<string>()

  return versions.map(version => {
    const label = version.label?.trim()
    const path = version.path?.trim()
    if (!label) {
      throw new Error('versions[].label cannot be empty.')
    }
    if (!path || !path.startsWith('/') || path.includes(' ')) {
      throw new Error(`versions[].path must be an absolute path like "${docsBasePath}/v1.0".`)
    }
    if (path.length > 1 && path.endsWith('/')) {
      throw new Error(`versions[].path must not end with "/" (got "${path}").`)
    }
    if (seenLabels.has(label)) {
      throw new Error(`Duplicate versions[].label "${label}".`)
    }
    if (seenPaths.has(path)) {
      throw new Error(`Duplicate versions[].path "${path}".`)
    }
    if (normalizedBasePath && !(path === normalizedBasePath || path.startsWith(`${normalizedBasePath}/`))) {
      throw new Error(`versions[].path "${path}" must live under "${docsBasePath}".`)
    }
    seenLabels.add(label)
    seenPaths.add(path)
    return { label, path }
  })
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
  const normalizedCapabilities = normalizeCapabilities(config)
  const baseCollections = normalizeCollections(config)
  const navPolicy = validateNavPolicy(config)
  const analytics = {
    ...defaultConfig.analytics,
    ...(config.analytics ?? {}),
    type: config.analytics?.type ?? defaultConfig.analytics?.type ?? 'none',
  }
  const experimental = {
    ...defaultConfig.experimental,
    ...(config.experimental ?? {}),
    editor: config.experimental?.editor ?? defaultConfig.experimental?.editor ?? false,
    export: config.experimental?.export ?? defaultConfig.experimental?.export ?? false,
    ai: config.experimental?.ai ?? defaultConfig.experimental?.ai ?? false,
  }
  const capabilityFlags = resolveCapabilityFlags({
    ...config,
    collections: baseCollections,
    experimental,
    capabilities: normalizedCapabilities,
  })
  const collections = applyStarterCapabilityOverrides(baseCollections, capabilityFlags)
  const sections = deriveSectionsFromCollections(collections)
  const versions = normalizeVersions(config, collections)
  const sourceNav = config.nav ?? buildSectionDefaultNav(collections)
  const navWithExtensions = applyPagesNav(sourceNav, pages)
  const filteredNav = filterDisabledSectionNav(navWithExtensions, collections)
  const nav = normalizeNavItems(filteredNav)
  const search = normalizeSearch(config)
  const typography = normalizeTypography(config)
  const theme = normalizeTheme(config, capabilityFlags)
  const i18n = normalizeI18n(config)
  validateCoreItemBudget(nav, navPolicy)

  return {
    ...defaultConfig,
    ...config,
    analytics,
    experimental,
    capabilities: normalizedCapabilities,
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
    theme,
    i18n,
    branding: config.branding ? { ...config.branding } : undefined,
    collections,
    sections,
    navPolicy,
    pages,
    versions,
  }
}
