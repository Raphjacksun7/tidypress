import { isStarterCollectionKey, type TidyPressConfig } from '@tidypress/config'
import { getConfig } from '@/config/getConfig'
import { getEnabledCollections } from '@/utils/collections'
import { loadPublishedCollectionEntries } from '@/utils/collection-entries'
import { RouteRegistry } from '@/routing/RouteRegistry'
import { LocaleHomeStrategy } from '@/routing/strategies/LocaleHomeStrategy'
import { RoutePath } from '@/routing/RoutePath'
import { defineRoute } from '@/routing/route-planning'
import type { CollectionRouteContext, SiteRouteDefinition } from '@/routing/types'

export class RoutePlanner {
  constructor(
    private readonly site: TidyPressConfig,
    private readonly registry: RouteRegistry = new RouteRegistry(),
    private readonly localeHomeStrategy: LocaleHomeStrategy = new LocaleHomeStrategy(),
  ) {}

  static async fromProjectConfig(): Promise<RoutePlanner> {
    const rawConfigModule = await import('@site-config')
    return new RoutePlanner(getConfig(rawConfigModule.default))
  }

  async planRoutes(): Promise<SiteRouteDefinition[]> {
    const routes: SiteRouteDefinition[] = [
      ...this.localeHomeStrategy.plan(this.site),
      ...this.planConfigRootPages(),
    ]
    const locales = this.site.i18n?.locales?.filter(Boolean) ?? []
    const defaultLocale = this.site.i18n?.defaultLocale ?? locales[0] ?? 'en'

    for (const collection of getEnabledCollections(this.site)) {
      const entries = await loadPublishedCollectionEntries(collection.key)
      const context: CollectionRouteContext = {
        site: this.site,
        collection,
        entries,
        locales,
        defaultLocale,
        usesLocaleRouting: isStarterCollectionKey(collection.key) && locales.length > 0,
      }
      const strategy = this.registry.resolve(context)
      routes.push(...strategy.plan(context))
    }

    return routes
  }

  private planConfigRootPages(): SiteRouteDefinition[] {
    if ((this.site.pages?.length ?? 0) === 0) {
      return []
    }
    return (this.site.pages ?? []).map(page => {
      const slug = typeof page === 'string' ? page : page.slug
      return defineRoute(RoutePath.fromPathname(`/${slug}`), {
        mode: 'root-page',
        collectionKey: 'pages',
        slug,
      })
    })
  }

  async toStaticPaths(): Promise<Array<{ params: { path: string | undefined }; props: { route: SiteRouteDefinition } }>> {
    const routes = await this.planRoutes()
    return routes.map(route => ({
      params: { path: RoutePath.fromPathname(route.path).toParam() || undefined },
      props: { route },
    }))
  }
}
