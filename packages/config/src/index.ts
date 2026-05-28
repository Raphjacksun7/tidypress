import { defineConfig } from './define.js'
import { withDefaults } from './normalize/with-defaults.js'
import { buildNavigationModel } from './navigation/model.js'
import { normalizePages, type NormalizedPageEntry } from './normalize/pages.js'

export { defineConfig }
export { defaultGithubFooterItem } from './defaults.js'
export { withDefaults }
export { normalizeHero, heroHasRenderableContent } from './normalize/hero.js'
export {
  tidyPressHeroScalarFields,
  heroHasRenderableScalarField,
  heroHasRenderableLinks,
  pickHeroConfigFields,
  type TidyPressHeroScalarField,
} from './registry/hero-fields.js'
export {
  tidyPressCollectionMetaIndexSegments,
  collectionMetaIndexSlug,
  parseCollectionMetaIndexSlug,
  resolveCollectionMetaIndexTitle,
  type TidyPressCollectionMetaIndexSegment,
} from './registry/collection-meta-index.js'
export {
  PAGEFIND_COLLECTION_FILTER_KEY,
  pagefindCollectionFilter,
  resolvePagefindContentAttributes,
  type PagefindContentAttributes,
} from './search/pagefind.js'
export {
  resolveSearchFilterCollections,
  type TidyPressSearchFilterCollection,
} from './search/filter-collections.js'
export {
  formatWritingImportMarkdown,
  tidyPressWritingImportFrontmatterFields,
  type TidyPressWritingImportArticle,
} from './content/writing-import.js'

export {
  tidyPressInitPresets,
  tidyPressYamlSchema,
  type TidyPressInitPresetDescriptor,
  type TidyPressInitPresetsFile,
} from './yaml/schema-files.js'

export {
  validateTidyPressYaml,
  type TidyPressYamlValidationIssue,
  type TidyPressYamlValidationResult,
} from './yaml/validate.js'
export { normalizeHome } from './normalize/home.js'
export {
  formatFooterCopyright,
  normalizeFooterItems,
  resolveSiteFooter,
} from './normalize/footer.js'
export { defaultFooterCredit } from './registry/footer-defaults.js'
export { footerIconPaths, getFooterIconPath } from './registry/footer-icons.js'
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
  tidyPressCodeThemePresets,
  tidyPressDocsPagingMode,
  tidyPressDocsPagingModes,
} from './schema/index.js'

export type {
  TidyPressAnalytics,
  TidyPressBranding,
  TidyPressCapabilities,
  TidyPressCapabilityName,
  TidyPressCodeTheme,
  TidyPressCodeThemePreset,
  TidyPressCollectionKind,
  TidyPressCollections,
  TidyPressConfig,
  TidyPressDocs,
  TidyPressDocsPaging,
  TidyPressDocsSidebarGroup,
  TidyPressExperimental,
  TidyPressHero,
  TidyPressHeroLink,
  TidyPressHome,
  TidyPressI18n,
  TidyPressI18nStrings,
  TidyPressListDisplay,
  TidyPressListGap,
  TidyPressListLayout,
  TidyPressRenderingExtensions,
  TidyPressRepository,
  TidyPressSearch,
  TidyPressSections,
  TidyPressTheme,
  TidyPressThemeMode,
  TidyPressThemePreset,
  TidyPressThemeTokenName,
  TidyPressThemeTokenSurface,
  TidyPressTypography,
  TidyPressVersion,
  TidyPressWritingEntryDisplay,
  FooterItem,
  FooterItemIcon,
  NavItem,
  PageEntry,
} from './schema/index.js'

export {
  defaultListDisplay,
  tidyPressListGapRegistry,
  tidyPressCollectionIndexPresentation,
  tidyPressHomePreviewPresentation,
  tidyPressListLayoutRegistry,
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
  type TidyPressCapabilityDescriptor,
  type TidyPressCapabilityKey,
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
  publicationSurfaceKeys,
  publicationSurfaceDefinitions,
  publicationSurfaceHomeOrder,
  publicationSurfaceHomeCollections,
  publicationSurfacePrimaryNavDefinitions,
  publicationSurfaceFooterNavItems,
  publicationSurfaceNavHref,
  publicationSurfaceNavLabel,
  publicationSurfaceUsesProjectsKind,
  collectionBasePath,
  isPublicationSurfaceKey,
  resolveSurfaceCollectionKind,
  type PublicationSurfaceKey,
  type PublicationSurfaceDefinition,
  type PublicationSurfaceKind,
} from './registry/publication-surfaces.js'

export {
  PLACEHOLDER_SITE_URL,
  isPlaceholderSiteUrl,
  siteUrlSetupHint,
  resolveProductionSiteUrl,
  getEffectiveSiteUrl,
  collectSiteUrlWarnings,
} from './registry/site-url.js'

export {
  tidyPressCollectionKindRegistry,
  tidyPressCollectionKinds,
  isTidyPressCollectionKind,
  formatTidyPressCollectionKinds,
  collectionKindUsesDocsSidebar,
  collectionKindContentSchema,
  collectionKindShellLayout,
  collectionKindRouteModes,
  collectionKindModeRequiresRenderedEntry,
  resolveCollectionKind,
  defaultCollectionKind,
  tidyPressDocFormViewConfig,
  isPageCollectionKind,
  isSearchableCollectionKind,
  type CollectionRouteViewMode,
  type CollectionShellLayout,
  type TidyPressCollectionContentSchema,
} from './registry/collection-kinds.js'

export {
  tidyPressDocFormRegistry,
  tidyPressDocForms,
  tidyPressDocFormSchema,
  defaultTidyPressDocForm,
  isTidyPressDocForm,
  formatTidyPressDocForms,
  type TidyPressDocForm,
  type TidyPressCustomDocFormDescriptor,
} from './registry/doc-forms.js'

export {
  tidyPressCodeThemeRegistry,
  isTidyPressCodeThemePreset,
  resolveCodeThemePreset,
  type TidyPressCodeThemeDescriptor,
} from './registry/code-themes.js'

export {
  validateCollectionRender,
  type TidyPressCollectionRender,
} from './registry/collection-render.js'

export {
  collectPluginManifest,
  collectPluginPathsToMount,
  formatPluginManifestModule,
  type CollectPluginManifestOptions,
  type PluginManifest,
} from './plugins/plugin-manifest.js'
