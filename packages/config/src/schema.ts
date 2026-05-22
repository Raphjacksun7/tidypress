export interface NavItem {
  label: string
  href: string
  external?: boolean
  target?: '_self' | '_blank'
  rel?: string
  priority?: 'core' | 'secondary'
}

export interface FooterItem {
  label: string
  href: string
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

export type DocsMintCollectionKind = 'docs' | 'writing' | 'page'

export interface DocsMintCollection extends DocsMintSection {
  kind?: DocsMintCollectionKind
  label?: string
}

export type DocsMintCollections = Record<string, DocsMintCollection>

export interface DocsMintWriting {
  description?: string
}

export type DocsMintTypographyScale = 'default' | 'medium' | 'large' | 'extra'

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

export interface DocsMintTheme {
  mode?: DocsMintThemeMode
  preset?: DocsMintThemePreset
  tokens?: DocsMintThemeTokens
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
  analytics?: DocsMintAnalytics
  versions?: DocsMintVersion[]
  i18n?: DocsMintI18n
  experimental?: DocsMintExperimental
  capabilities?: DocsMintCapabilities
  writing?: DocsMintWriting
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
  sections?: DocsMintSections
  dateFormat?: Intl.DateTimeFormatOptions
  dateLocale?: string
  navPolicy?: {
    mode?: 'strict' | 'relaxed'
    maxVisibleDesktop?: number
    maxVisibleMobile?: number
  }
}
