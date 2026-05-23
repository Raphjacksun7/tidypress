import { defineConfig } from './define.js'
import { withDefaults } from './normalize/with-defaults.js'
import { buildNavigationModel } from './navigation/model.js'
import { normalizePages, type NormalizedPageEntry } from './normalize/pages.js'

export { defineConfig }
export { withDefaults }
export { buildNavigationModel }
export { normalizePages, type NormalizedPageEntry }
export {
  docsMintCodeThemePresets,
  docsMintDocsPagingMode,
  docsMintDocsPagingModes,
} from './schema/index.js'

export type {
  DocsMintAnalytics,
  DocsMintBranding,
  DocsMintCapabilities,
  DocsMintCapabilityName,
  DocsMintCodeTheme,
  DocsMintCodeThemePreset,
  DocsMintCollectionKind,
  DocsMintCollections,
  DocsMintConfig,
  DocsMintDocs,
  DocsMintDocsPaging,
  DocsMintDocsSidebarGroup,
  DocsMintExperimental,
  DocsMintHome,
  DocsMintI18n,
  DocsMintI18nStrings,
  DocsMintListDisplay,
  DocsMintListGap,
  DocsMintListLayout,
  DocsMintRenderingExtensions,
  DocsMintRepository,
  DocsMintSearch,
  DocsMintSections,
  DocsMintTheme,
  DocsMintThemeMode,
  DocsMintThemePreset,
  DocsMintThemeTokenName,
  DocsMintThemeTokenSurface,
  DocsMintTypography,
  DocsMintVersion,
  DocsMintWritingEntryDisplay,
  FooterItem,
  FooterItemIcon,
  NavItem,
  PageEntry,
} from './schema/index.js'

export {
  defaultListDisplay,
  docsMintListGapRegistry,
  docsMintListLayoutRegistry,
  isCardListLayout,
  listGapStackClass,
  listLayoutPresentation,
  mergeListDisplay,
  resolveCollectionIndexDisplay,
  resolveDefaultHomeSectionKeys,
  resolveHomeCollectionDisplay,
  type ResolvedListDisplay,
} from './display/list-display.js'

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
} from './registry/capabilities.js'

export {
  migrateSectionsToCollections,
  type SectionsMigrationOptions,
  type SectionsMigrationResult,
} from './migration/index.js'

export {
  isStarterCollectionKey,
  starterCollectionKeys,
  isLegacySectionKey,
  legacySectionKeys,
  defaultHomePreviewSectionKeys,
  inferStarterCollectionKind,
  isDocsCollectionKey,
  isDocsStarterKey,
} from './registry/legacy.js'

export {
  docsMintCollectionKindRegistry,
  docsMintCollectionKinds,
  isDocsMintCollectionKind,
  formatDocsMintCollectionKinds,
  collectionKindUsesDocsSidebar,
  collectionKindContentSchema,
  isPageCollectionKind,
  type DocsMintCollectionContentSchema,
} from './registry/collection-kinds.js'

export {
  docsMintDocFormRegistry,
  docsMintDocForms,
  docsMintDocFormSchema,
  defaultDocsMintDocForm,
  isDocsMintDocForm,
  formatDocsMintDocForms,
  type DocsMintDocForm,
  type DocsMintCustomDocFormDescriptor,
} from './registry/doc-forms.js'

export {
  docsMintCodeThemeRegistry,
  isDocsMintCodeThemePreset,
  resolveCodeThemePreset,
  type DocsMintCodeThemeDescriptor,
} from './registry/code-themes.js'

export {
  validateCollectionRender,
  type DocsMintCollectionRender,
} from './registry/collection-render.js'

export {
  collectPluginManifest,
  collectPluginPathsToMount,
  formatPluginManifestModule,
  type CollectPluginManifestOptions,
  type PluginManifest,
} from './plugins/plugin-manifest.js'
