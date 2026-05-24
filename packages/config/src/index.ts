import { defineConfig } from './define.js'
import { withDefaults } from './normalize/with-defaults.js'
import { buildNavigationModel } from './navigation/model.js'
import { normalizePages, type NormalizedPageEntry } from './normalize/pages.js'

export { defineConfig }
export { withDefaults }
export { normalizeHero, heroHasRenderableContent } from './normalize/hero.js'
export {
  docsMintHeroScalarFields,
  heroHasRenderableScalarField,
  heroHasRenderableLinks,
  pickHeroConfigFields,
  type DocsMintHeroScalarField,
} from './registry/hero-fields.js'
export {
  docsMintCollectionMetaIndexSegments,
  collectionMetaIndexSlug,
  parseCollectionMetaIndexSlug,
  resolveCollectionMetaIndexTitle,
  type DocsMintCollectionMetaIndexSegment,
} from './registry/collection-meta-index.js'
export {
  PAGEFIND_COLLECTION_FILTER_KEY,
  pagefindCollectionFilter,
  resolvePagefindContentAttributes,
  type PagefindContentAttributes,
} from './search/pagefind.js'
export {
  resolveSearchFilterCollections,
  type DocsMintSearchFilterCollection,
} from './search/filter-collections.js'
export {
  formatWritingImportMarkdown,
  docsMintWritingImportFrontmatterFields,
  type DocsMintWritingImportArticle,
} from './content/writing-import.js'

export {
  docsMintInitPresets,
  docsMintYamlSchema,
  type DocsMintInitPresetDescriptor,
  type DocsMintInitPresetsFile,
} from './yaml/schema-files.js'

export {
  validateDocsMintYaml,
  type DocsMintYamlValidationIssue,
  type DocsMintYamlValidationResult,
} from './yaml/validate.js'
export { normalizeHome } from './normalize/home.js'
export { normalizeFooterItems } from './normalize/footer.js'
export {
  LINK_NEW_TAB_ATTRIBUTES,
  LINK_REL_BLANK,
  LINK_TARGET_BLANK,
  ensureBlankTargetRel,
  isExternalHref,
  resolveEntryLinkAttributes,
  resolveHeroLinkAttributes,
  resolveNewTabLinkAttributes,
  type ResolvedLinkAttributes,
} from './links/link-attributes.js'
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
  DocsMintHero,
  DocsMintHeroLink,
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
  docsMintCollectionIndexPresentation,
  docsMintHomePreviewPresentation,
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
  collectionKindShellLayout,
  collectionKindRouteModes,
  collectionKindModeRequiresRenderedEntry,
  resolveCollectionKind,
  defaultCollectionKind,
  docsMintDocFormViewConfig,
  isPageCollectionKind,
  isSearchableCollectionKind,
  type CollectionRouteViewMode,
  type CollectionShellLayout,
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
