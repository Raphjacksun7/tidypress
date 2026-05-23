import type { DocsMintCollectionKind } from '../registry/collection-kinds.js'
import type { DocsMintHome, DocsMintListDisplay, DocsMintWritingEntryDisplay } from '../display/list-display.js'
import type { DocsMintCollectionRender } from '../registry/collection-render.js'

export interface NavItem {
  label: string
  href: string
  external?: boolean
  target?: '_self' | '_blank'
  rel?: string
  priority?: 'core' | 'secondary'
}

export type FooterItemIcon =
  | 'github'
  | 'x'
  | 'linkedin'
  | 'discord'
  | 'youtube'
  | 'instagram'
  | 'bluesky'
  | 'facebook'
  | 'reddit'
  | 'twitch'
  | 'mastodon'
  | 'slack'
  | 'telegram'
  | 'tiktok'
  | 'npm'
  | 'rss'
  | 'email'

export interface FooterItem {
  /** Display text used for text links and as the accessible label for icon links. */
  label: string
  href: string
  /**
   * When set, renders an SVG icon instead of text.
   * The `label` is still used as a screen-reader-only accessible name.
   */
  icon?: FooterItemIcon
  external?: boolean
}

export interface PageEntryObject {
  slug: string
  navLabel?: string
}

export type PageEntry = string | PageEntryObject

export interface DocsMintRepository {
  url?: string
  editPath?: string
  branch?: string
}

export interface DocsMintSearch {
  exclude?: string[]
}

export interface DocsMintSection {
  enabled?: boolean
  basePath?: string
}

export interface DocsMintSections {
  docs?: DocsMintSection
  writing?: DocsMintSection
}

export interface DocsMintCollection extends DocsMintSection {
  kind?: DocsMintCollectionKind
  label?: string
  /** List/card layout for collection index and homepage previews. */
  display?: DocsMintListDisplay
  /**
   * Custom collection rendering. Points at project-local presentation + view modules
   * (loaded on build/dev via the plugin manifest).
   */
  render?: DocsMintCollectionRender
}

/** Extension hooks declared in config for future engine releases. */
export interface DocsMintRenderingExtensions {
  /**
   * Register doc forms beyond built-in `doc` | `manual`.
   * Keys match `form` in docs collection frontmatter.
   */
  docForms?: Record<
    string,
    {
      label?: string
      presentation?: string
      views?: string
    }
  >
}

export type DocsMintCollections = Record<string, DocsMintCollection>

export interface DocsMintWriting {
  description?: string
  entry?: DocsMintWritingEntryDisplay
}

/** A named group of pages in the left sidebar. */
export interface DocsMintDocsSidebarGroup {
  /** Optional heading shown above this group of links. */
  label?: string
  /** Slugs of docs entries, relative to the collection base (e.g. `'getting-started'`). */
  items: string[]
}

export const docsMintDocsPagingMode = {
  top: 'top',
  bottom: 'bottom',
  none: 'none',
} as const

export const docsMintDocsPagingModes = [
  docsMintDocsPagingMode.top,
  docsMintDocsPagingMode.bottom,
  docsMintDocsPagingMode.none,
] as const

export type DocsMintDocsPagingMode = (typeof docsMintDocsPagingModes)[number]
export type DocsMintDocsPaging = boolean | DocsMintDocsPagingMode

/**
 * Configuration for the docs section — sidebar layout, etc.
 * Applied to the built-in `docs` collection.
 */
export interface DocsMintDocs {
  /**
   * Explicit sidebar groups. When set, the sidebar renders these groups in order
   * with optional section labels, replacing the automatic folder-based grouping.
   * Slugs are relative to the collection base, e.g. `'getting-started'`, `'v1/overview'`.
   */
  sidebar?: DocsMintDocsSidebarGroup[]
  /**
   * Previous/next chapter navigation placement for docs pages.
   * Omit or set `true` to render above and below content, `false`/`'none'` to hide,
   * or `'top'`/`'bottom'` to render once.
   */
  paging?: DocsMintDocsPaging
}

/** Resolved scales: 'small' | 'medium' | 'large'. 'default' and 'extra' are accepted aliases. */
export type DocsMintTypographyScale = 'small' | 'medium' | 'large' | 'extra' | 'default'

export interface DocsMintTypography {
  scale?: DocsMintTypographyScale
}

export type DocsMintThemeMode = 'guardrailed' | 'custom'
export type DocsMintThemePreset = 'baseline'
export type DocsMintThemeTokenName = 'bg' | 'fg' | 'muted' | 'border' | 'surface' | 'codeBg' | 'codeFg'
export type DocsMintThemeTokenSurface = Record<DocsMintThemeTokenName, string>

export interface DocsMintThemeTokens {
  light: Partial<DocsMintThemeTokenSurface>
  dark: Partial<DocsMintThemeTokenSurface>
}

export const docsMintCodeThemePresets = [
  'claude',
  'jetbrains',
  'github',
  'dracula',
  'material',
  'nord',
] as const

export type DocsMintCodeThemePreset = (typeof docsMintCodeThemePresets)[number]

export interface DocsMintCodeTheme {
  /**
   * Syntax-highlighting palette preset for fenced code blocks.
   * - `claude`: opinionated balanced contrast (default)
   * - `jetbrains`: IntelliJ-like vibrant palette
   * - `github`: conservative GitHub style
   */
  preset?: DocsMintCodeThemePreset
}

export interface DocsMintTheme {
  mode?: DocsMintThemeMode
  preset?: DocsMintThemePreset
  tokens?: DocsMintThemeTokens
  code?: DocsMintCodeTheme
}

export interface DocsMintAnalytics {
  type?: 'none' | 'plausible' | 'fathom' | 'umami'
  endpoint?: string
  siteId?: string
}

export interface DocsMintVersion {
  label: string
  path: string
}

export interface DocsMintI18n {
  defaultLocale?: string
  locales?: string[]
  strings?: Record<string, DocsMintI18nStrings>
}

export interface DocsMintI18nStrings {
  docsLabel?: string
  writingLabel?: string
  moreLabel?: string
  searchLabel?: string
  searchPlaceholder?: string
  searchEmptyLabel?: string
  searchUnavailableLabel?: string
  searchNoResultsLabel?: string
  untitledLabel?: string
  onThisPageLabel?: string
  editThisPageLabel?: string
  allDocsLabel?: string
  allWritingLabel?: string
  writingTitle?: string
  docsTitle?: string
  copyLabel?: string
  copiedLabel?: string
  languageLabel?: string
  chapterPreviousLabel?: string
  chapterNextLabel?: string
  manualFormBadgeLabel?: string
}

export interface DocsMintExperimental {
  editor?: boolean
  export?: boolean
  ai?: boolean
}

export type DocsMintCapabilityName =
  | 'docs'
  | 'writing'
  | 'pages'
  | 'editor'
  | 'export'
  | 'ai'
  | 'theming'
  | 'themingCustom'

export interface DocsMintCapabilities {
  enable?: DocsMintCapabilityName[]
  disable?: DocsMintCapabilityName[]
}

export interface DocsMintBranding {
  /**
   * Monochrome SVG path used beside site name in UI (home title and nav brand).
   * Example: '/favicon.svg'
   */
  icon?: string
  /**
   * Favicon path. When omitted, the runtime falls back to `branding.icon`.
   */
  favicon?: string
}

export interface DocsMintConfig {
  name: string
  description?: string
  home?: DocsMintHome
  analytics?: DocsMintAnalytics
  versions?: DocsMintVersion[]
  i18n?: DocsMintI18n
  experimental?: DocsMintExperimental
  capabilities?: DocsMintCapabilities
  writing?: DocsMintWriting
  docs?: DocsMintDocs
  typography?: DocsMintTypography
  theme?: DocsMintTheme
  branding?: DocsMintBranding
  pages?: PageEntry[]
  nav?: NavItem[]
  footer?: FooterItem[]
  siteUrl?: string
  repository?: DocsMintRepository
  search?: DocsMintSearch
  collections?: DocsMintCollections
  /** Rendering extension registry (`docForms` loaded at build/dev). */
  extensions?: DocsMintRenderingExtensions
  sections?: DocsMintSections
  dateFormat?: Intl.DateTimeFormatOptions
  dateLocale?: string
  navPolicy?: {
    mode?: 'strict' | 'relaxed'
    maxVisibleDesktop?: number
    maxVisibleMobile?: number
  }
}
