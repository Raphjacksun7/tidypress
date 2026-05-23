import type { DocsMintConfig, DocsMintVersion } from '@docsmint/config'
import { resolveLocale, stripLocalePrefix, withLocalePrefix } from '@/i18n/locale'
import { getCollectionBasePath, getCollectionEntrySlug } from '@/utils/collections'
import {
  normalizePathname,
  relativeDocsPath,
  resolveActiveVersionPath,
  versionContentPrefix,
  versionTargetPath,
} from '@/routing/versioning'

type EntryLike = { id: string }

function stripKnownLocalePrefix(slug: string, locales: string[]): string {
  const [first, ...rest] = slug.split('/')
  if (first && locales.includes(first) && rest.length > 0) {
    return rest.join('/')
  }
  return slug
}

function entrySupportsDocSlug(entry: EntryLike, slug: string, locale: string | undefined, site: DocsMintConfig): boolean {
  const locales = site.i18n?.locales?.filter(Boolean) ?? []
  const defaultLocale = site.i18n?.defaultLocale ?? locales[0] ?? 'en'
  const entrySlug = getCollectionEntrySlug(entry.id)

  if (!locale || locale === defaultLocale) {
    return entrySlug === slug
  }

  return entrySlug === `${locale}/${slug}` || entrySlug === slug
}

function hasDocSlug(entries: EntryLike[], slug: string, locale: string | undefined, site: DocsMintConfig): boolean {
  return entries.some(entry => entrySupportsDocSlug(entry, slug, locale, site))
}

export function switchLocaleTarget(pathname: string, targetLocale: string, site: DocsMintConfig): string {
  const localeState = resolveLocale(pathname, site.i18n)
  const basePath = stripLocalePrefix(pathname, localeState.activeLocale)
  if (targetLocale === localeState.defaultLocale) {
    return basePath
  }
  return withLocalePrefix(basePath, targetLocale)
}

export function isDocsPath(pathname: string, site: DocsMintConfig): boolean {
  const localeState = resolveLocale(pathname, site.i18n)
  const docsBasePath = getCollectionBasePath(site, 'docs')
  const localizedDocsBase = withLocalePrefix(docsBasePath, localeState.activeLocale)
  const normalizedPath = normalizePathname(pathname)
  const normalizedDocsBase = normalizePathname(localizedDocsBase)
  return normalizedPath === normalizedDocsBase || normalizedPath.startsWith(`${normalizedDocsBase}/`)
}

export function versionSelectorState(
  site: DocsMintConfig,
  pathname: string,
  entries: EntryLike[],
): {
  versions: DocsMintVersion[]
  docsBasePath: string
  selectedPath?: string
  targets: Record<string, string>
} {
  const localeState = resolveLocale(pathname, site.i18n)
  const locale = localeState.activeLocale
  const docsBasePath = withLocalePrefix(getCollectionBasePath(site, 'docs'), locale)
  const versions = (site.versions ?? []).map(version => ({
    ...version,
    path: withLocalePrefix(version.path, locale),
  }))
  const selectedPath = resolveActiveVersionPath(versions, pathname) ?? versions[0]?.path
  const currentRelativePath = selectedPath
    ? relativeDocsPath(pathname, docsBasePath, selectedPath)
    : relativeDocsPath(pathname, docsBasePath)
  const targets: Record<string, string> = {}

  for (const version of versions) {
    const prefix = versionContentPrefix(version.path, docsBasePath)
    if (!prefix) {
      // Root-anchored current version: navigate to the equivalent root-level page when possible.
      const rootSlug = stripKnownLocalePrefix(currentRelativePath, localeState.locales)
      targets[version.path] = rootSlug && hasDocSlug(entries, rootSlug, locale, site)
        ? versionTargetPath(version.path, currentRelativePath)
        : version.path
      continue
    }
    const candidateSlug = currentRelativePath
      ? `${prefix}/${stripKnownLocalePrefix(currentRelativePath, localeState.locales)}`
      : prefix
    targets[version.path] = hasDocSlug(entries, candidateSlug, locale, site)
      ? versionTargetPath(version.path, currentRelativePath)
      : version.path
  }

  return { versions, docsBasePath, selectedPath, targets }
}
