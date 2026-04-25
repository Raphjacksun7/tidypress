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

export interface DocsMintWriting {
  description?: string
}

export type DocsMintTypographyScale = 'default' | 'medium' | 'large' | 'extra'

export interface DocsMintTypography {
  scale?: DocsMintTypographyScale
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
  writing?: DocsMintWriting
  typography?: DocsMintTypography
  branding?: DocsMintBranding
  pages?: PageEntry[]
  nav?: NavItem[]
  footer?: FooterItem[]
  siteUrl?: string
  repository?: DocsMintRepository
  search?: DocsMintSearch
  sections?: DocsMintSections
  dateFormat?: Intl.DateTimeFormatOptions
  dateLocale?: string
  navPolicy?: {
    mode?: 'strict' | 'relaxed'
    maxVisibleDesktop?: number
    maxVisibleMobile?: number
  }
}
