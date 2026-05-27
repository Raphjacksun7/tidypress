import type { TidyPressConfig, TidyPressI18nStrings } from '@tidypress/config'
import { resolveCapabilityFlags } from '@tidypress/config'

export type I18nConfig = {
  defaultLocale?: string
  locales?: string[]
  strings?: Record<string, TidyPressI18nStrings>
}

export type LocaleState = {
  activeLocale?: string
  locales: string[]
  defaultLocale: string
}

const defaultUiStrings: Required<TidyPressI18nStrings> = {
  docsLabel: 'docs',
  writingLabel: 'writing',
  moreLabel: 'more',
  searchLabel: 'search',
  searchPlaceholder: 'Search docs...',
  searchEmptyLabel: 'Type to search...',
  searchUnavailableLabel: 'Search unavailable in dev mode - run tidypress build, then tidypress preview.',
  searchNoResultsLabel: 'No results for "{query}"',
  searchFilterLabel: 'Filter by collection',
  searchFilterAllLabel: 'all',
  untitledLabel: 'Untitled',
  onThisPageLabel: 'On this page',
  editThisPageLabel: 'Edit this page',
  allDocsLabel: 'all docs ->',
  allWritingLabel: 'all writing ->',
  writingTitle: 'Writing',
  docsTitle: 'Docs',
  copyLabel: 'copy',
  copiedLabel: 'copied',
  languageLabel: 'language',
  chapterPreviousLabel: 'Previous',
  chapterNextLabel: 'Next',
  manualFormBadgeLabel: 'Manual',
}

export function resolveLocale(pathname: string, i18n?: I18nConfig): LocaleState {
  const locales = i18n?.locales?.filter(Boolean) ?? []
  const defaultLocale = i18n?.defaultLocale ?? locales[0] ?? 'en'
  if (locales.length === 0) {
    return { activeLocale: undefined, locales: [], defaultLocale }
  }
  const [, firstSegment] = pathname.split('/')
  const activeLocale = locales.includes(firstSegment) ? firstSegment : undefined
  return { activeLocale, locales, defaultLocale }
}

export function withLocalePrefix(href: string, locale?: string): string {
  if (!locale || !href.startsWith('/')) {
    return href
  }
  if (href.startsWith(`/${locale}/`) || href === `/${locale}`) {
    return href
  }
  return `/${locale}${href}`
}

export function stripLocalePrefix(pathname: string, locale?: string): string {
  if (!locale) {
    return pathname
  }
  if (pathname === `/${locale}`) {
    return '/'
  }
  if (pathname.startsWith(`/${locale}/`)) {
    return pathname.slice(locale.length + 1)
  }
  return pathname
}

export function switchLocalePath(pathname: string, targetLocale: string, i18n?: I18nConfig): string {
  const localeState = resolveLocale(pathname, i18n)
  const basePath = stripLocalePrefix(pathname, localeState.activeLocale)
  if (targetLocale === localeState.defaultLocale) {
    return basePath
  }
  return withLocalePrefix(basePath, targetLocale)
}

function defaultSearchPlaceholder(site: TidyPressConfig): string {
  const flags = resolveCapabilityFlags(site)
  if (flags.docs) {
    return defaultUiStrings.searchPlaceholder
  }
  if (flags.writing) {
    return 'Search writing...'
  }
  return 'Search...'
}

export function getUiStrings(site: TidyPressConfig, localeState: LocaleState): Required<TidyPressI18nStrings> {
  const locale = localeState.activeLocale ?? localeState.defaultLocale
  const defaultStrings = site.i18n?.strings?.[localeState.defaultLocale] ?? {}
  const localeStrings = site.i18n?.strings?.[locale] ?? {}
  return {
    ...defaultUiStrings,
    searchPlaceholder: defaultSearchPlaceholder(site),
    ...defaultStrings,
    ...localeStrings,
  }
}

export type LocalizedEntry<T> = {
  entry: T
  slug: string
  locale: string
}

export function localizeEntries<T extends { id: string }>(
  entries: T[],
  localeState: LocaleState,
  targetLocale: string,
): LocalizedEntry<T>[] {
  if (localeState.locales.length === 0) {
    return entries.map(entry => ({ entry, slug: entry.id, locale: targetLocale }))
  }

  return entries.flatMap(entry => {
    const parts = entry.id.split('/')
    const first = parts[0]
    if (first && localeState.locales.includes(first) && parts.length > 1) {
      if (first !== targetLocale) {
        return []
      }
      return [{ entry, locale: first, slug: parts.slice(1).join('/') }]
    }

    if (targetLocale !== localeState.defaultLocale) {
      return []
    }

    return [{ entry, locale: targetLocale, slug: entry.id }]
  })
}
