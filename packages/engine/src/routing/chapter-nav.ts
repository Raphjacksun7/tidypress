import { docsMintDocFormRegistry, type DocsMintConfig } from '@docsmint/config'
import {
  getCollectionBasePath,
  getCollectionEntrySlug,
  getLocalizedCollectionEntryPath,
} from '@/utils/collections'
import { sortDocs } from '@/utils/sort'
import { versionContentPrefix } from '@/routing/versioning'

export interface DocChapterNavLink {
  title: string
  href: string
}

export interface DocChapterNav {
  previous?: DocChapterNavLink
  next?: DocChapterNavLink
}

type DocLikeEntry = {
  id: string
  data: {
    title?: string
    form?: string
  }
}

function entryHref(
  site: DocsMintConfig,
  collectionKey: string,
  entry: DocLikeEntry,
  locale?: string,
): string {
  return getLocalizedCollectionEntryPath(site, collectionKey, entry.id, locale)
}

function matchesEntry(entry: DocLikeEntry, routeEntryId: string | undefined, routeSlug: string | undefined): boolean {
  if (routeEntryId && entry.id === routeEntryId) {
    return true
  }
  const slug = getCollectionEntrySlug(entry.id)
  return routeSlug !== undefined && slug === routeSlug
}

function resolveVersionPrefix(
  site: DocsMintConfig,
  collectionKey: string,
  entrySlug: string,
): string | undefined {
  if (!site.versions?.length) return undefined
  const basePath = getCollectionBasePath(site, collectionKey)
  for (const version of site.versions) {
    const prefix = versionContentPrefix(version.path, basePath)
    if (prefix && (entrySlug === prefix || entrySlug.startsWith(`${prefix}/`))) {
      return prefix
    }
  }
  return undefined
}

function firstSegment(entry: DocLikeEntry): string | undefined {
  return getCollectionEntrySlug(entry.id).split('/')[0]
}

function stripLocaleSegment(entry: DocLikeEntry, locale: string): string {
  const slug = getCollectionEntrySlug(entry.id)
  return slug === locale ? '' : slug.replace(new RegExp(`^${locale}/`), '')
}

function entriesForRouteLocale(
  site: DocsMintConfig,
  entries: DocLikeEntry[],
  locale: string | undefined,
): DocLikeEntry[] {
  const locales = site.i18n?.locales?.filter(Boolean) ?? []
  const defaultLocale = site.i18n?.defaultLocale ?? locales[0]

  if (!locale || locale === defaultLocale) {
    return entries.filter(entry => {
      const first = firstSegment(entry)
      return !first || !locales.includes(first)
    })
  }

  const explicit = new Map<string, DocLikeEntry>()
  const fallback = new Map<string, DocLikeEntry>()

  for (const entry of entries) {
    const first = firstSegment(entry)
    if (first === locale) {
      explicit.set(stripLocaleSegment(entry, locale), entry)
      continue
    }
    if (!first || !locales.includes(first)) {
      fallback.set(getCollectionEntrySlug(entry.id), entry)
    }
  }

  const localized = new Map(fallback)
  for (const [slug, entry] of explicit) {
    localized.set(slug, entry)
  }
  return [...localized.values()]
}

function displaySlugForSidebar(entry: DocLikeEntry, locale: string | undefined): string {
  const slug = getCollectionEntrySlug(entry.id)
  return locale ? slug.replace(new RegExp(`^${locale}/`), '') : slug
}

function sortChapterEntries(
  site: DocsMintConfig,
  entries: DocLikeEntry[],
  locale: string | undefined,
): DocLikeEntry[] {
  const sorted = sortDocs(entries)
  const sidebarItems = site.docs?.sidebar?.flatMap(group => group.items) ?? []
  if (sidebarItems.length === 0) {
    return sorted
  }

  const order = new Map(sidebarItems.map((slug, index) => [slug, index]))
  return [...sorted].sort((a, b) => {
    const aOrder = order.get(displaySlugForSidebar(a, locale)) ?? Number.MAX_SAFE_INTEGER
    const bOrder = order.get(displaySlugForSidebar(b, locale)) ?? Number.MAX_SAFE_INTEGER
    return aOrder === bOrder ? 0 : aOrder - bOrder
  })
}

function buildFormChapterNav(
  site: DocsMintConfig,
  collectionKey: string,
  entries: DocLikeEntry[],
  route: { entryId?: string; slug?: string; locale?: string },
  form: string,
): DocChapterNav | undefined {
  const currentSlug = route.entryId
    ? getCollectionEntrySlug(route.entryId)
    : route.slug
  const versionPrefix = currentSlug
    ? resolveVersionPrefix(site, collectionKey, currentSlug)
    : undefined
  const basePath = getCollectionBasePath(site, collectionKey)

  const localizedEntries = entriesForRouteLocale(site, entries, route.locale)
  const allFormEntries = sortChapterEntries(site, localizedEntries, route.locale).filter(entry =>
    form === 'doc'
      ? entry.data.form === undefined || entry.data.form === 'doc'
      : entry.data.form === form,
  )
  const chapters = versionPrefix
    ? allFormEntries.filter(entry => {
        const slug = getCollectionEntrySlug(entry.id)
        return slug === versionPrefix || slug.startsWith(`${versionPrefix}/`)
      })
    : allFormEntries.filter(entry => {
        const slug = getCollectionEntrySlug(entry.id)
        return !site.versions?.some(v => {
          const prefix = versionContentPrefix(v.path, basePath)
          return prefix && (slug === prefix || slug.startsWith(`${prefix}/`))
        })
      })

  const currentIndex = chapters.findIndex(entry => matchesEntry(entry, route.entryId, route.slug))
  if (currentIndex < 0) {
    return undefined
  }

  const nav: DocChapterNav = {}
  const locale = route.locale

  if (currentIndex > 0) {
    const previous = chapters[currentIndex - 1]
    nav.previous = {
      title: previous.data.title ?? getCollectionEntrySlug(previous.id),
      href: entryHref(site, collectionKey, previous, locale),
    }
  }

  if (currentIndex < chapters.length - 1) {
    const next = chapters[currentIndex + 1]
    nav.next = {
      title: next.data.title ?? getCollectionEntrySlug(next.id),
      href: entryHref(site, collectionKey, next, locale),
    }
  }

  return nav.previous || nav.next ? nav : undefined
}

export function buildDocChapterNav(
  site: DocsMintConfig,
  collectionKey: string,
  entries: DocLikeEntry[],
  route: { entryId?: string; slug?: string; locale?: string },
): DocChapterNav | undefined {
  return buildFormChapterNav(site, collectionKey, entries, route, 'doc')
}

export function buildManualChapterNav(
  site: DocsMintConfig,
  collectionKey: string,
  entries: DocLikeEntry[],
  route: { entryId?: string; slug?: string; locale?: string },
): DocChapterNav | undefined {
  return buildFormChapterNav(site, collectionKey, entries, route, 'manual')
}

export function docFormLabel(form: keyof typeof docsMintDocFormRegistry | undefined): string | undefined {
  if (!form || !(form in docsMintDocFormRegistry)) {
    return undefined
  }
  return docsMintDocFormRegistry[form].label
}
