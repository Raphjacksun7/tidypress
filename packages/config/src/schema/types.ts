import type { TidyPressCollectionKind } from '../registry/collection-kinds.js'
import type { TidyPressHome, TidyPressListDisplay, TidyPressWritingEntryDisplay } from '../display/list-display.js'
import type { TidyPressCollectionRender } from '../registry/collection-render.js'

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
  /** Set by config normalization; do not set in user config. */
  target?: string
  /** Set by config normalization; do not set in user config. */
  rel?: string
}

/** Inline link in a footer main-band text slot. */
export interface TidyPressFooterMainLink {
  label: string
  href: string
  external?: boolean
  /** Set by config normalization; do not set in user config. */
  target?: string
  /** Set by config normalization; do not set in user config. */
  rel?: string
}

/** Plain text or a list of inline links (rendered with · separators). */
export type TidyPressFooterMainSlot = string | TidyPressFooterMainLink[]

/**
 * Top footer band — text slots today (plain text or inline links).
 * Reserved for richer blocks later (menus, grids, newsletter, banners, etc.).
 */
export interface TidyPressFooterMain {
  /** Start (left) slot. */
  start?: TidyPressFooterMainSlot
  /** End (right) slot. Language switcher renders here when i18n is enabled. */
  end?: TidyPressFooterMainSlot
}

/** Product credit segment on the sub-footer attribution line. */
export interface TidyPressFooterCredit {
  /** Plain text before the credit link (for example `, Made with `). */
  prefix?: string
  /** Credit link label. */
  label: string
  /** Credit link URL. */
  href: string
}

/** Footer settings in `tidypress.config` (object form). */
export interface TidyPressFooterSettings {
  /** Top band text slots (`start` / `end`). */
  main?: TidyPressFooterMain
  /**
   * @deprecated Use `main.end`. Kept for backward compatibility.
   */
  aside?: string
  /**
   * Copyright on the sub-footer attribution line. Omit for `© {year} {name}`.
   * Supports `{year}` and `{name}` tokens.
   */
  copyright?: string
  /** Append product credit on the attribution line. Default: true. */
  showCredit?: boolean
  /** Credit link copy when `showCredit` is true. Omitted fields use package defaults. */
  credit?: Partial<TidyPressFooterCredit>
  /** Icon/text links in the sub-footer (left). Default includes GitHub when empty. */
  links?: FooterItem[]
}

/** Config input: link array (shorthand) or settings object. */
export type TidyPressFooterInput = FooterItem[] | TidyPressFooterSettings

/** Normalized footer model passed to the engine after `withDefaults`. */
export interface TidyPressFooter {
  main: TidyPressFooterMain
  copyright?: string
  showCredit: boolean
  /** Resolved credit segment; set when `showCredit` is true. */
  credit?: TidyPressFooterCredit
  links: FooterItem[]
}

export interface PageEntryObject {
  slug: string
  navLabel?: string
}

export type PageEntry = string | PageEntryObject

export interface TidyPressRepository {
  url?: string
  editPath?: string
  branch?: string
}

export interface TidyPressSearch {
  exclude?: string[]
}

export interface TidyPressSection {
  enabled?: boolean
  basePath?: string
}

export interface TidyPressSections {
  docs?: TidyPressSection
  writing?: TidyPressSection
}

export interface TidyPressCollection extends TidyPressSection {
  kind?: TidyPressCollectionKind
  label?: string
  /** List/card layout for collection index and homepage previews. */
  display?: TidyPressListDisplay
  /**
   * Custom collection rendering. Points at project-local presentation + view modules
   * (loaded on build/dev via the plugin manifest).
   */
  render?: TidyPressCollectionRender
}

/** Extension hooks declared in config for future engine releases. */
export interface TidyPressRenderingExtensions {
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

export type TidyPressCollections = Record<string, TidyPressCollection>

export interface TidyPressWriting {
  description?: string
  entry?: TidyPressWritingEntryDisplay
}

/** A named group of pages in the left sidebar. */
export interface TidyPressDocsSidebarGroup {
  /** Optional heading shown above this group of links. */
  label?: string
  /** Slugs of docs entries, relative to the collection base (e.g. `'getting-started'`). */
  items: string[]
}

export const tidyPressDocsPagingMode = {
  top: 'top',
  bottom: 'bottom',
  none: 'none',
} as const

export const tidyPressDocsPagingModes = [
  tidyPressDocsPagingMode.top,
  tidyPressDocsPagingMode.bottom,
  tidyPressDocsPagingMode.none,
] as const

export type TidyPressDocsPagingMode = (typeof tidyPressDocsPagingModes)[number]
export type TidyPressDocsPaging = boolean | TidyPressDocsPagingMode

/**
 * Configuration for the docs section — sidebar layout, etc.
 * Applied to the built-in `docs` collection.
 */
export interface TidyPressDocs {
  /**
   * Explicit sidebar groups. When set, the sidebar renders these groups in order
   * with optional section labels, replacing the automatic folder-based grouping.
   * Slugs are relative to the collection base, e.g. `'getting-started'`, `'v1/overview'`.
   */
  sidebar?: TidyPressDocsSidebarGroup[]
  /**
   * Previous/next chapter navigation placement for docs pages.
   * Omit or set `true` to render above and below content, `false`/`'none'` to hide,
   * or `'top'`/`'bottom'` to render once.
   */
  paging?: TidyPressDocsPaging
}

/** Resolved scales: 'small' | 'medium' | 'large'. 'default' and 'extra' are accepted aliases. */
export type TidyPressTypographyScale = 'small' | 'medium' | 'large' | 'extra' | 'default'

export interface TidyPressTypography {
  scale?: TidyPressTypographyScale
}

export type TidyPressThemeMode = 'guardrailed' | 'custom'
export type TidyPressThemePreset = 'baseline'
export type TidyPressThemeTokenName = 'bg' | 'fg' | 'muted' | 'border' | 'surface' | 'codeBg' | 'codeFg'
export type TidyPressThemeTokenSurface = Record<TidyPressThemeTokenName, string>

export interface TidyPressThemeTokens {
  light: Partial<TidyPressThemeTokenSurface>
  dark: Partial<TidyPressThemeTokenSurface>
}

export const tidyPressCodeThemePresets = [
  'claude',
  'jetbrains',
  'github',
  'dracula',
  'material',
  'nord',
] as const

export type TidyPressCodeThemePreset = (typeof tidyPressCodeThemePresets)[number]

export interface TidyPressCodeTheme {
  /**
   * Syntax-highlighting palette preset for fenced code blocks.
   * - `claude`: opinionated balanced contrast (default)
   * - `jetbrains`: IntelliJ-like vibrant palette
   * - `github`: conservative GitHub style
   */
  preset?: TidyPressCodeThemePreset
}

export interface TidyPressTheme {
  mode?: TidyPressThemeMode
  preset?: TidyPressThemePreset
  tokens?: TidyPressThemeTokens
  code?: TidyPressCodeTheme
}

export interface TidyPressAnalytics {
  type?: 'none' | 'plausible' | 'fathom' | 'umami'
  endpoint?: string
  siteId?: string
}

export interface TidyPressVersion {
  label: string
  path: string
}

export interface TidyPressI18n {
  defaultLocale?: string
  locales?: string[]
  strings?: Record<string, TidyPressI18nStrings>
}

export interface TidyPressI18nStrings {
  docsLabel?: string
  writingLabel?: string
  moreLabel?: string
  searchLabel?: string
  searchPlaceholder?: string
  searchEmptyLabel?: string
  searchUnavailableLabel?: string
  searchNoResultsLabel?: string
  searchFilterLabel?: string
  searchFilterAllLabel?: string
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

export interface TidyPressExperimental {
  editor?: boolean
  export?: boolean
  ai?: boolean
}

export type TidyPressCapabilityName =
  | 'docs'
  | 'writing'
  | 'pages'
  | 'editor'
  | 'export'
  | 'ai'
  | 'theming'
  | 'themingCustom'

export interface TidyPressCapabilities {
  enable?: TidyPressCapabilityName[]
  disable?: TidyPressCapabilityName[]
}

export interface TidyPressBranding {
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

export interface TidyPressHeroLink {
  label: string
  href: string
  external?: boolean
}

export interface TidyPressHero {
  /** Opt-in home hero bar (role, pronunciation, lead, links). Default: false. */
  enabled?: boolean
  role?: string
  pronunciation?: string
  lead?: string
  /** Public image path (for example `/images/portrait.jpg`) or absolute URL. */
  image?: string
  links?: TidyPressHeroLink[]
}

export interface TidyPressConfig {
  name: string
  description?: string
  hero?: TidyPressHero
  home?: TidyPressHome
  analytics?: TidyPressAnalytics
  versions?: TidyPressVersion[]
  i18n?: TidyPressI18n
  experimental?: TidyPressExperimental
  capabilities?: TidyPressCapabilities
  writing?: TidyPressWriting
  docs?: TidyPressDocs
  typography?: TidyPressTypography
  theme?: TidyPressTheme
  branding?: TidyPressBranding
  pages?: PageEntry[]
  nav?: NavItem[]
  footer?: TidyPressFooterInput
  siteUrl?: string
  repository?: TidyPressRepository
  search?: TidyPressSearch
  collections?: TidyPressCollections
  /** Rendering extension registry (`docForms` loaded at build/dev). */
  extensions?: TidyPressRenderingExtensions
  sections?: TidyPressSections
  dateFormat?: Intl.DateTimeFormatOptions
  dateLocale?: string
  navPolicy?: {
    mode?: 'strict' | 'relaxed'
    maxVisibleDesktop?: number
    maxVisibleMobile?: number
  }
}
