import {
  docsMintDocsPagingMode,
  isDocsMintDocForm,
  type DocsMintConfig,
  type DocsMintDocForm,
  type DocsMintDocsPaging,
} from '@docsmint/config'
import { getCollection } from 'astro:content'
import { sortDocs } from '@/utils/sort'
import { onlyPublished } from '@/utils/published'
import {
  getCollectionBasePath,
  getCollectionEntryPath,
  getCollectionEntrySlug,
} from '@/utils/collections'
import { localizeEntries, resolveLocale } from '@/i18n/locale'
import { isSearchExcluded } from '@/search/exclusion'
import { versionContentPrefix } from '@/routing/versioning'
import type { SiteRouteDefinition } from '@/routing/types'
import { buildDocChapterNav, buildManualChapterNav, docFormLabel } from '@/routing/chapter-nav'
import { resolveCollectionRouteViewKey, resolveDocFormRouteViewKey } from '@/routing/view-registry'
import type { RouteViewBundle } from '@/collections/bundle'
import type { ICollection } from '@/collections/ICollection'

function readEntryDocForm(data: { form?: string }): DocsMintDocForm | undefined {
  return isDocsMintDocForm(data.form) ? data.form : undefined
}

function resolveChapterNavVisibility(
  site: DocsMintConfig,
  entryPaging: DocsMintDocsPaging | undefined,
): { top: boolean; bottom: boolean } {
  const value = entryPaging ?? site.docs?.paging
  if (value === undefined || value === true) {
    return { top: true, bottom: true }
  }
  if (value === false || value === docsMintDocsPagingMode.none) {
    return { top: false, bottom: false }
  }
  return {
    top: value === docsMintDocsPagingMode.top,
    bottom: value === docsMintDocsPagingMode.bottom,
  }
}

export class DocsCollection implements ICollection {
  readonly presentationTarget = 'site-docs' as const

  constructor(private readonly site: DocsMintConfig) {}

  async buildIndex(route: SiteRouteDefinition): Promise<RouteViewBundle> {
    const collectionKey = route.collectionKey!
    const basePath = getCollectionBasePath(this.site, collectionKey)
    const localePrefix = route.locale ? `/${route.locale}` : ''
    const localizedBase = `${localePrefix}${basePath}`.replace(/\/{2,}/g, '/') || basePath

    const docs = sortDocs(onlyPublished(await getCollection(collectionKey as 'docs')))
    const plannedFirst = route.entryId ? docs.find(entry => entry.id === route.entryId) : undefined
    const firstVersionPrefix = this.site.versions?.[0]
      ? versionContentPrefix(this.site.versions[0].path, basePath)
      : undefined
    const firstByVersion = firstVersionPrefix
      ? docs.find(entry => {
          const id = getCollectionEntrySlug(entry.id)
          return id === firstVersionPrefix || id.startsWith(`${firstVersionPrefix}/`)
        })
      : undefined
    const first = plannedFirst ?? firstByVersion ?? docs[0]
    if (!first) {
      return {
        viewKey: resolveCollectionRouteViewKey(this.presentationTarget, route),
        site: this.site,
        route,
        title: 'Not found',
        headings: [],
        pagefindIgnore: true,
        redirectTo: '/404',
      }
    }

    const firstSlug = route.slug ?? getCollectionEntrySlug(first.id).replace(new RegExp(`^${route.locale}/`), '')
    const firstHref = route.locale
      ? `${localizedBase}/${firstSlug}`.replace(/\/{2,}/g, '/')
      : getCollectionEntryPath(this.site, collectionKey, first.id)
    const pagePath = getCollectionEntryPath(this.site, collectionKey, first.id)

    return {
      viewKey: resolveCollectionRouteViewKey(this.presentationTarget, route),
      site: this.site,
      route,
      title: (first.data as { title?: string }).title ?? first.id,
      description: (first.data as { description?: string }).description,
      headings: [],
      pagefindIgnore:
        (first.data as { search?: boolean }).search === false || isSearchExcluded(this.site, pagePath),
      editPath: pagePath,
      collectionRootPath: localizedBase,
      firstDocHref: firstHref,
    }
  }

  async buildEntry(route: SiteRouteDefinition): Promise<RouteViewBundle> {
    const collectionKey = route.collectionKey!
    const entries = onlyPublished(await getCollection(collectionKey as 'docs'))
    const entry = entries.find(
      candidate => candidate.id === route.entryId || getCollectionEntrySlug(candidate.id) === route.slug,
    )
    if (!entry) {
      return {
        viewKey: resolveCollectionRouteViewKey(this.presentationTarget, route),
        site: this.site,
        route,
        title: 'Not found',
        headings: [],
        pagefindIgnore: true,
        redirectTo: '/404',
      }
    }

    const basePath = getCollectionBasePath(this.site, collectionKey)
    const pagePath = route.locale
      ? `/${route.locale}${basePath}/${route.slug ?? getCollectionEntrySlug(entry.id)}`.replace(/\/{2,}/g, '/')
      : getCollectionEntryPath(this.site, collectionKey, entry.id)
    const entryData = entry.data as {
      title?: string
      form?: string
      part?: string
      paging?: DocsMintDocsPaging
    }
    const docForm = readEntryDocForm(entryData)
    const chapterNavVisibility = resolveChapterNavVisibility(this.site, entryData.paging)
    const navRoute = { entryId: route.entryId, slug: route.slug, locale: route.locale }
    // All doc-form entries get chapter navigation; manual has its own sequence.
    const chapterNav =
      docForm === 'manual'
        ? buildManualChapterNav(this.site, collectionKey, entries, navRoute)
        : buildDocChapterNav(this.site, collectionKey, entries, navRoute)

    return {
      viewKey: resolveDocFormRouteViewKey(docForm, route),
      site: this.site,
      route,
      title: entryData.title ?? entry.id,
      description: (entry.data as { description?: string }).description,
      headings: [],
      pagefindIgnore:
        (entry.data as { search?: boolean }).search === false || isSearchExcluded(this.site, pagePath),
      editPath: getCollectionEntryPath(this.site, collectionKey, entry.id),
      entryMeta: {
        docForm,
        formLabel: docForm ? docFormLabel(docForm) : undefined,
        part: entryData.part,
        chapterNav,
        showChapterNavTop: chapterNavVisibility.top,
        showChapterNavBottom: chapterNavVisibility.bottom,
      },
    }
  }
}
