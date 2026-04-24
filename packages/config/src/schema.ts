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

export interface CustomPageExtension {
  slug: string
  title: string
  description?: string
  navLabel?: string
}

export interface DocsMintExtensions {
  customPages?: CustomPageExtension[]
}

export interface DocsMintConfig {
  name: string
  description?: string
  nav?: NavItem[]
  footer?: FooterItem[]
  siteUrl?: string
  dateFormat?: Intl.DateTimeFormatOptions
  dateLocale?: string
  extensions?: DocsMintExtensions
  navPolicy?: {
    mode?: 'strict' | 'relaxed'
    maxVisibleDesktop?: number
    maxVisibleMobile?: number
  }
}
