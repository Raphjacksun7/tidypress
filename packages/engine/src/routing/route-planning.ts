import type { DocsMintConfig, DocsMintVersion } from '@docsmint/config'
import { localizeEntries, type LocaleState } from '@/i18n/locale'
import { getCollectionBasePath, getCollectionEntrySlug } from '@/utils/collections'
import { versionContentPrefix, stripDocExtension } from '@/routing/versioning'
import { RoutePath } from '@/routing/RoutePath'
import type { RoutePolicy, SiteRouteDefinition } from '@/routing/types'

export function resolveLocaleState(site: DocsMintConfig): LocaleState {
  const locales = site.i18n?.locales?.filter(Boolean) ?? []
  const defaultLocale = site.i18n?.defaultLocale ?? locales[0] ?? 'en'
  return { activeLocale: undefined, locales, defaultLocale }
}

export function resolveRoutePolicy(site: DocsMintConfig): RoutePolicy {
  const localeState = resolveLocaleState(site)
  return {
    localeMode: 'root-default',
    versionScope: 'docs-only',
    defaultLocale: localeState.defaultLocale,
    locales: localeState.locales,
  }
}

export function nonDefaultLocales(policy: RoutePolicy): string[] {
  return policy.locales.filter(locale => locale !== policy.defaultLocale)
}

export function collectionBasePath(site: DocsMintConfig, key: string): string {
  return getCollectionBasePath(site, key).replace(/^\/+/, '')
}

export function defineRoute(
  path: RoutePath,
  route: Omit<SiteRouteDefinition, 'path'>,
): SiteRouteDefinition {
  return { ...route, path: path.toPathname() }
}

export function planVersionRootRoutes(
  site: DocsMintConfig,
  collectionKey: string,
  entries: Array<{ id: string }>,
  versions: DocsMintVersion[] | undefined,
  locale?: string,
): SiteRouteDefinition[] {
  if (!versions || versions.length === 0) {
    return []
  }
  // The locale-aware base path is used for the route URL (e.g. /fr/docs/v2).
  // The non-localized base path is used to compute the version prefix from
  // version.path (e.g. /docs/v2 → prefix "v2") — locale must not be included
  // here because version.path is always locale-agnostic.
  const nonLocalizedBase = getCollectionBasePath(site, collectionKey)
  const base = RoutePath.fromPathname(nonLocalizedBase).withLocale(locale)
  const existingSlugs = new Set(
    entries.map(entry => getCollectionEntrySlug(entry.id)),
  )
  const routes: SiteRouteDefinition[] = []

  for (const version of versions) {
    const prefix = versionContentPrefix(version.path, nonLocalizedBase)
    if (!prefix || existingSlugs.has(prefix)) {
      continue
    }
    const firstEntry = entries.find(entry => {
      const docId = getCollectionEntrySlug(entry.id)
      return docId === prefix || docId.startsWith(`${prefix}/`)
    })
    if (!firstEntry) {
      continue
    }
    routes.push(
      defineRoute(base.append(prefix), {
        mode: 'version-root',
        collectionKey,
        locale,
        slug: prefix,
        entryId: firstEntry.id,
        isVersionRoot: true,
      }),
    )
  }

  return routes
}

/**
 * For each versioned doc entry (e.g. v2/getting-started) that does NOT have a
 * locale-specific translation (e.g. fr/v2/getting-started), generate a
 * locale-prefixed route (e.g. /fr/docs/v2/getting-started) that serves the
 * default-locale content with locale UI strings.
 *
 * This is the standard "content fallback" pattern used by Mintlify, VitePress,
 * and other mature docs frameworks: locale switching always works, falling back
 * to the default locale when a translation is missing.
 */
export function planVersionedFallbackRoutes(
  site: DocsMintConfig,
  collectionKey: string,
  entries: Array<{ id: string }>,
  versions: DocsMintVersion[] | undefined,
  locale: string,
  localeState: LocaleState,
): SiteRouteDefinition[] {
  if (!versions?.length) return []

  const nonLocalizedBase = getCollectionBasePath(site, collectionKey)
  const base = RoutePath.fromPathname(nonLocalizedBase).withLocale(locale)

  // Slugs already covered by locale-specific content via planLocalizedEntryRoutes.
  const localizedSlugs = new Set(
    localizeEntries(entries, localeState, locale).map(({ slug }) => getCollectionEntrySlug(slug)),
  )

  const routes: SiteRouteDefinition[] = []

  for (const version of versions) {
    const prefix = versionContentPrefix(version.path, nonLocalizedBase)
    if (!prefix) continue

    // Default-locale versioned entries: those whose slug starts with the version
    // prefix and have no locale prefix in their id.
    const versionedEntries = entries.filter(entry => {
      const slug = getCollectionEntrySlug(entry.id)
      const isVersioned = slug === prefix || slug.startsWith(`${prefix}/`)
      const hasLocalePrefix = localeState.locales.some(
        l => l.length > 0 && (slug === l || slug.startsWith(`${l}/`)),
      )
      return isVersioned && !hasLocalePrefix
    })

    for (const entry of versionedEntries) {
      const slug = getCollectionEntrySlug(entry.id)
      if (localizedSlugs.has(slug)) continue // locale-specific translation exists
      routes.push(
        defineRoute(base.append(slug), {
          mode: 'collection-entry',
          collectionKey,
          locale,
          slug,
          entryId: entry.id,
        }),
      )
    }
  }

  return routes
}

export function planLocalizedEntryRoutes(
  site: DocsMintConfig,
  collectionKey: string,
  entries: Array<{ id: string }>,
  locale: string,
  localeState: LocaleState,
  options: { prefixLocale?: boolean } = {},
): SiteRouteDefinition[] {
  const basePath = RoutePath.fromPathname(getCollectionBasePath(site, collectionKey))
  const base = options.prefixLocale ? basePath.withLocale(locale) : basePath
  return localizeEntries(entries, localeState, locale).map(({ entry, slug }) => {
    const normalizedSlug = getCollectionEntrySlug(slug)
    return defineRoute(base.append(normalizedSlug), {
      mode: 'collection-entry',
      collectionKey,
      locale,
      slug: normalizedSlug,
      entryId: entry.id,
    })
  })
}

export function planDefaultLocaleEntryRoutes(
  site: DocsMintConfig,
  collectionKey: string,
  entries: Array<{ id: string }>,
  localeState: LocaleState,
): SiteRouteDefinition[] {
  const base = RoutePath.fromPathname(getCollectionBasePath(site, collectionKey))
  const rootDefaultEntries = entries.filter(entry => {
    const first = getCollectionEntrySlug(entry.id).split('/')[0]
    return !first || !localeState.locales.includes(first)
  })
  return rootDefaultEntries.map(entry => {
    const normalizedSlug = getCollectionEntrySlug(entry.id)
    return defineRoute(base.append(normalizedSlug), {
      mode: 'collection-entry',
      collectionKey,
      slug: normalizedSlug,
      entryId: entry.id,
    })
  })
}

export function planDefaultEntryRoutes(
  site: DocsMintConfig,
  collectionKey: string,
  entries: Array<{ id: string }>,
): SiteRouteDefinition[] {
  const base = RoutePath.fromPathname(getCollectionBasePath(site, collectionKey))
  return entries.map(entry => {
    const slug = getCollectionEntrySlug(entry.id)
    return defineRoute(base.append(slug), {
      mode: 'collection-entry',
      collectionKey,
      slug,
      entryId: entry.id,
    })
  })
}

export function stripDocIds(entries: Array<{ id: string }>): Array<{ id: string }> {
  return entries.map(entry => ({ ...entry, id: stripDocExtension(entry.id) }))
}
