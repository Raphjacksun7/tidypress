import { defaultConfig } from '../defaults.js'
import { normalizeCapabilities, resolveCapabilityFlags } from '../registry/capabilities.js'
import type { DocsMintConfig } from '../schema/index.js'
import {
  applyStarterCapabilityOverrides,
  deriveSectionsFromCollections,
  normalizeCollections,
} from './collections.js'
import { validateRenderingExtensions } from './extensions.js'
import { normalizeI18n } from './i18n.js'
import {
  buildSectionDefaultNav,
  filterDisabledSectionNav,
  normalizeNavItems,
  validateCoreItemBudget,
  validateNavPolicy,
} from './nav.js'
import { applyPagesNav, collectPageEntries } from './pages.js'
import { normalizeSearch } from './search.js'
import { normalizeTheme } from './theme.js'
import { normalizeTypography } from './typography.js'
import { normalizeVersions } from './versions.js'

export function withDefaults(config: DocsMintConfig): DocsMintConfig {
  const pages = collectPageEntries(config)
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
  validateRenderingExtensions(config.extensions)

  return {
    ...defaultConfig,
    ...config,
    extensions: config.extensions ? { ...config.extensions } : undefined,
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
