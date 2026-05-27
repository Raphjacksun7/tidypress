import type { TidyPressConfig } from '@tidypress/config'
import {
  isDocsCollectionKey,
  isTidyPressCollectionKind,
  isTidyPressDocForm,
} from '@tidypress/config'
import { getCollection } from 'astro:content'
import { isCollectionEnabled } from '@/utils/collections'
import { getUiStrings, resolveLocale } from '@/i18n/locale'
import { isSearchExcluded } from '@/search/exclusion'
import {
  buildHomePreviewItems,
  getHomeSectionKeys,
  homeSectionMoreLabel,
  homePreviewListFlags,
  homeSectionTitle,
  resolveHomeDisplayForCollection,
} from '@/utils/home-preview'
import type { SiteRouteDefinition } from '@/routing/types'
import { PresentationRegistry } from '@/collections/PresentationRegistry'
import { ContentCollection } from '@/collections/ContentCollection'
import { DocsCollection } from '@/collections/DocsCollection'
import { PageCollection } from '@/collections/PageCollection'
import { WritingCollection } from '@/collections/WritingCollection'
import { ProjectsCollection } from '@/collections/ProjectsCollection'
import type { ICollection } from '@/collections/ICollection'
import {
  ensurePluginRouteViewRegistry,
  PAGE_ROOT_VIEW,
  SITE_LOCALE_HOME_VIEW,
  SYSTEM_NOT_FOUND_VIEW,
} from '@/routing/view-registry'
import type { RouteViewBundle } from '@/collections/bundle'
import { EntryResolver } from '@/routing/EntryResolver'
import {
  createBuiltinDelegateCollection,
  DocFormDelegateCollection,
} from '@/plugins/delegate'
import { loadPluginPresentations } from '@/plugins/loader'
import {
  getPluginDocFormKeys,
  getPluginPresentationModules,
} from '@/plugins/manifest'

export class RouteFactory {
  private readonly builtinRegistry: PresentationRegistry
  private readonly pluginByScope: Map<string, ICollection>
  private readonly customDocForms: Set<string>
  private readonly entryResolver = new EntryResolver()

  private constructor(
    private readonly site: TidyPressConfig,
    pluginByScope: Map<string, ICollection>,
    customDocForms: string[],
  ) {
    const dateFormatter = new Intl.DateTimeFormat(this.site.dateLocale ?? 'en-US', {
      ...(this.site.dateFormat ?? { year: 'numeric', month: 'short', day: 'numeric' }),
      timeZone: 'UTC',
    })
    this.builtinRegistry = new PresentationRegistry([
      new DocsCollection(site),
      new ContentCollection(site),
      new ProjectsCollection(site),
      new WritingCollection(site, dateFormatter),
      new PageCollection(site),
    ])
    this.pluginByScope = pluginByScope
    this.customDocForms = new Set(customDocForms)
    const docsPresentation = this.builtinRegistry.resolve('site-docs')
    for (const formKey of customDocForms) {
      const scope = `form:${formKey}`
      if (!this.pluginByScope.has(scope)) {
        this.pluginByScope.set(scope, new DocFormDelegateCollection(formKey, docsPresentation))
      }
    }
  }

  static async create(site: TidyPressConfig, projectRoot: string): Promise<RouteFactory> {
    await ensurePluginRouteViewRegistry()
    const presentationModules = await getPluginPresentationModules()
    const pluginByScope = await loadPluginPresentations(site, projectRoot, presentationModules)
    const dateFormatter = new Intl.DateTimeFormat(site.dateLocale ?? 'en-US', {
      ...(site.dateFormat ?? { year: 'numeric', month: 'short', day: 'numeric' }),
      timeZone: 'UTC',
    })

    for (const [collectionKey, collection] of Object.entries(site.collections ?? {})) {
      if (!collection?.enabled || !collection.render) {
        continue
      }
      if (isDocsCollectionKey(collectionKey) || pluginByScope.has(collectionKey)) {
        continue
      }
      const delegate = createBuiltinDelegateCollection(site, collectionKey, dateFormatter)
      if (delegate) {
        pluginByScope.set(collectionKey, delegate)
      }
    }

    const customDocForms = await getPluginDocFormKeys()
    return new RouteFactory(site, pluginByScope, customDocForms)
  }

  async create(route: SiteRouteDefinition): Promise<RouteViewBundle> {
    if (route.mode === 'locale-home' && route.locale) {
      return this.createLocaleHome(route.locale, route)
    }
    if (route.mode === 'root-page' && route.slug) {
      return this.createRootPage(route.slug, route)
    }
    if (!route.collectionKey) {
      return this.notFound(route)
    }
    if (!isCollectionEnabled(this.site, route.collectionKey)) {
      return { ...this.notFound(route), redirectTo: '/404' }
    }

    const presentation = await this.resolvePresentation(route)

    if (route.mode === 'collection-index') {
      return presentation.buildIndex(route)
    }
    if (route.mode === 'collection-entry' || route.mode === 'version-root') {
      return presentation.buildEntry(route)
    }

    return this.notFound(route)
  }

  private async resolvePresentation(route: SiteRouteDefinition): Promise<ICollection> {
    const collectionKey = route.collectionKey!

    if (this.pluginByScope.has(collectionKey)) {
      return this.pluginByScope.get(collectionKey)!
    }

    if (isDocsCollectionKey(collectionKey) && (route.mode === 'collection-entry' || route.mode === 'version-root')) {
      const entry = await this.entryResolver.resolve(route)
      const form = (entry?.data as { form?: string } | undefined)?.form
      if (form && !isTidyPressDocForm(form) && this.customDocForms.has(form)) {
        const scope = `form:${form}`
        if (this.pluginByScope.has(scope)) {
          return this.pluginByScope.get(scope)!
        }
      }
    }

    if (isDocsCollectionKey(collectionKey)) {
      return this.builtinRegistry.resolve('site-docs')
    }
    const kind = this.site.collections?.[collectionKey]?.kind
    if (isTidyPressCollectionKind(kind)) {
      return this.builtinRegistry.resolve(kind)
    }
    throw new Error(
      `Collection "${collectionKey}" has no registered kind. Use the docs collection key for documentation, or set collections.${collectionKey}.kind to a registered value.`,
    )
  }

  private notFound(route: SiteRouteDefinition): RouteViewBundle {
    return {
      viewKey: SYSTEM_NOT_FOUND_VIEW,
      site: this.site,
      route,
      title: 'Not found',
      headings: [],
      pagefindIgnore: true,
    }
  }

  private async createRootPage(slug: string, route: SiteRouteDefinition): Promise<RouteViewBundle> {
    const pages = await getCollection('pages')
    const entry = pages.find(candidate => candidate.id === slug)
    if (!entry) {
      throw new Error(
        `Missing page content for slug "${slug}". Add src/content/pages/${slug}.md`,
      )
    }
    const pagePath = `/${slug}`
    return {
      viewKey: PAGE_ROOT_VIEW,
      site: this.site,
      route,
      title: entry.data.title ?? slug,
      description: entry.data.description,
      headings: [],
      pagefindIgnore: entry.data.search === false || isSearchExcluded(this.site, pagePath),
      showPageTitle: true,
    }
  }

  private async createLocaleHome(locale: string, route: SiteRouteDefinition): Promise<RouteViewBundle> {
    const dateFormatter = new Intl.DateTimeFormat(this.site.dateLocale ?? 'en-US', {
      ...(this.site.dateFormat ?? { year: 'numeric', month: 'short', day: 'numeric' }),
      timeZone: 'UTC',
    })
    const strings = getUiStrings(this.site, resolveLocale(`/${locale}`, this.site.i18n))
    const sections = []

    for (const collectionKey of getHomeSectionKeys(this.site)) {
      const { items, moreHref } = await buildHomePreviewItems(this.site, collectionKey, {
        locale,
        dateFormatter,
      })
      if (items.length === 0) {
        continue
      }

      sections.push({
        key: collectionKey,
        title: homeSectionTitle(this.site, collectionKey, strings),
        ...homePreviewListFlags(this.site, collectionKey),
        items,
        moreHref,
        moreLabel: moreHref ? homeSectionMoreLabel(this.site, collectionKey, strings) : undefined,
        display: resolveHomeDisplayForCollection(this.site, collectionKey),
      })
    }

    return {
      viewKey: SITE_LOCALE_HOME_VIEW,
      site: this.site,
      route,
      title: this.site.name,
      description: this.site.description,
      headings: [],
      pagefindIgnore: true,
      localeHome: {
        locale,
        sections,
      },
    }
  }
}
