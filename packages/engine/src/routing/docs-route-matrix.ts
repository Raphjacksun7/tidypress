import type { DocsMintConfig } from '@docsmint/config'
import { getCollectionBasePath, getCollectionEntrySlug } from '@/utils/collections'
import { sortDocs } from '@/utils/sort'
import { RoutePath } from '@/routing/RoutePath'
import { defineRoute, nonDefaultLocales, resolveRoutePolicy } from '@/routing/route-planning'
import { versionContentPrefix } from '@/routing/versioning'
import type { RoutePolicy, SiteRouteDefinition } from '@/routing/types'

type DocEntry = {
  id: string
  data: Record<string, unknown>
}

type LocaleEntry = {
  entry: DocEntry
  slug: string
  fallback: boolean
}

function firstSegment(id: string): string | undefined {
  return getCollectionEntrySlug(id).split('/')[0]
}

function stripFirstSegment(id: string): string {
  return getCollectionEntrySlug(id).split('/').slice(1).join('/')
}

function localeOfEntry(entry: DocEntry, policy: RoutePolicy): string | undefined {
  const first = firstSegment(entry.id)
  return first && policy.locales.includes(first) ? first : undefined
}

function defaultLocaleEntries(entries: DocEntry[], policy: RoutePolicy): LocaleEntry[] {
  const rootDefault = new Map<string, DocEntry>()

  for (const entry of sortDocs(entries)) {
    const entryLocale = localeOfEntry(entry, policy)
    if (!entryLocale) {
      rootDefault.set(getCollectionEntrySlug(entry.id), entry)
    }
  }

  return [...rootDefault.keys()]
    .map(slug => ({
      slug,
      entry: rootDefault.get(slug)!,
      fallback: false,
    }))
    .filter(item => Boolean(item.entry))
}

function localizedEntries(entries: DocEntry[], locale: string, policy: RoutePolicy): LocaleEntry[] {
  const explicit = new Map<string, DocEntry>()
  for (const entry of sortDocs(entries)) {
    if (localeOfEntry(entry, policy) === locale) {
      explicit.set(stripFirstSegment(entry.id), entry)
    }
  }

  const localized: LocaleEntry[] = [...explicit.entries()].map(([slug, entry]) => ({
    slug,
    entry,
    fallback: false,
  }))

  for (const item of defaultLocaleEntries(entries, policy)) {
    if (!explicit.has(item.slug)) {
      localized.push({ ...item, fallback: true })
    }
  }

  return localized
}

function versionPrefixes(site: DocsMintConfig, collectionKey: string): string[] {
  const basePath = getCollectionBasePath(site, collectionKey)
  return (site.versions ?? [])
    .map(version => versionContentPrefix(version.path, basePath))
    .filter((prefix): prefix is string => Boolean(prefix))
}

function firstEntryForVersion(entries: LocaleEntry[], prefix: string): LocaleEntry | undefined {
  return sortDocs(entries.map(item => ({ ...item.entry, id: item.slug })))
    .map(sorted => entries.find(item => item.slug === sorted.id)!)
    .find(item => item.slug === prefix || item.slug.startsWith(`${prefix}/`))
}

// When a sidebar is configured, prefer its item order to determine the first entry.
function sidebarFirstEntry(candidates: LocaleEntry[], site: DocsMintConfig): LocaleEntry | undefined {
  const sidebarItems = site.docs?.sidebar?.flatMap(group => group.items) ?? []
  if (sidebarItems.length === 0) return undefined
  for (const slug of sidebarItems) {
    const found = candidates.find(e => e.slug === slug)
    if (found) return found
  }
  return undefined
}

function firstEntry(entries: LocaleEntry[], site: DocsMintConfig, collectionKey: string): LocaleEntry | undefined {
  const basePath = getCollectionBasePath(site, collectionKey)
  const allPrefixes = versionPrefixes(site, collectionKey)

  // If the first configured version is root-anchored (path === docsBase, no content prefix),
  // redirect to the first entry that does NOT belong to any versioned sub-folder.
  const firstVersion = (site.versions ?? [])[0]
  if (firstVersion) {
    const firstPrefix = versionContentPrefix(firstVersion.path, basePath)
    if (!firstPrefix) {
      const rootEntries = entries.filter(
        e => !allPrefixes.some(p => e.slug === p || e.slug.startsWith(`${p}/`)),
      )
      return sidebarFirstEntry(rootEntries, site) ?? rootEntries[0] ?? entries[0]
    }
    return firstEntryForVersion(entries, firstPrefix) ?? entries[0]
  }

  const firstPrefix = allPrefixes[0]
  if (firstPrefix) {
    return firstEntryForVersion(entries, firstPrefix) ?? entries[0]
  }
  return sidebarFirstEntry(entries, site) ?? entries[0]
}

function entryRoute(
  base: RoutePath,
  collectionKey: string,
  item: LocaleEntry,
  locale?: string,
): SiteRouteDefinition {
  return defineRoute(base.append(item.slug), {
    mode: 'collection-entry',
    collectionKey,
    locale,
    slug: item.slug,
    entryId: item.entry.id,
    fallbackReason: item.fallback ? 'default-locale-content' : undefined,
  })
}

function versionRootRoutes(
  site: DocsMintConfig,
  collectionKey: string,
  base: RoutePath,
  entries: LocaleEntry[],
  locale?: string,
): SiteRouteDefinition[] {
  return versionPrefixes(site, collectionKey).flatMap(prefix => {
    const first = firstEntryForVersion(entries, prefix)
    if (!first) {
      return []
    }
    return [
      defineRoute(base.append(prefix), {
        mode: 'version-root',
        collectionKey,
        locale,
        slug: prefix,
        entryId: first.entry.id,
        isVersionRoot: true,
        fallbackReason: first.fallback ? 'default-locale-content' : undefined,
      }),
    ]
  })
}

export function buildDocsRouteMatrix(
  site: DocsMintConfig,
  collectionKey: string,
  entries: DocEntry[],
): SiteRouteDefinition[] {
  const policy = resolveRoutePolicy(site)
  const base = RoutePath.fromPathname(getCollectionBasePath(site, collectionKey))
  const defaultEntries = defaultLocaleEntries(entries, policy)
  const firstDefault = firstEntry(defaultEntries, site, collectionKey)
  const routes: SiteRouteDefinition[] = [
    defineRoute(base, {
      mode: 'collection-index',
      collectionKey,
      entryId: firstDefault?.entry.id,
    }),
    ...defaultEntries.map(item => entryRoute(base, collectionKey, item)),
    ...versionRootRoutes(site, collectionKey, base, defaultEntries),
  ]

  for (const locale of nonDefaultLocales(policy)) {
    const entriesForLocale = localizedEntries(entries, locale, policy)
    const localizedBase = base.withLocale(locale)
    const firstLocalized = firstEntry(entriesForLocale, site, collectionKey)

    routes.push(
      defineRoute(localizedBase, {
        mode: 'collection-index',
        collectionKey,
        locale,
        entryId: firstLocalized?.entry.id,
      }),
      ...entriesForLocale.map(item => entryRoute(localizedBase, collectionKey, item, locale)),
      ...versionRootRoutes(site, collectionKey, localizedBase, entriesForLocale, locale),
    )
  }

  const byPath = new Map<string, SiteRouteDefinition>()
  for (const route of routes) {
    if (!byPath.has(route.path)) {
      byPath.set(route.path, route)
    }
  }
  return [...byPath.values()]
}

export const docsRouteMatrixInternals = {
  defaultLocaleEntries,
  localizedEntries,
  versionPrefixes,
}
