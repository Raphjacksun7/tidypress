import {
  isDocsCollectionKey,
  isDocsMintCollectionKind,
  type DocsMintConfig,
} from '@docsmint/config'
import type { ICollection } from '@/collections/ICollection'
import { ContentCollection } from '@/collections/ContentCollection'
import { DocsCollection } from '@/collections/DocsCollection'
import { PageCollection } from '@/collections/PageCollection'
import { WritingCollection } from '@/collections/WritingCollection'
import { isCollectionRouteViewMode } from '@/routing/view-registry'
import type { SiteRouteDefinition } from '@/routing/types'
import type { RouteViewBundle } from '@/collections/bundle'

function resolvePluginViewKey(scopeKey: string, route: SiteRouteDefinition): string {
  if (!isCollectionRouteViewMode(route.mode)) {
    throw new Error(`Route mode "${route.mode}" is not a collection view.`)
  }
  return `${scopeKey}:${route.mode}`
}

export class BuiltinDelegateCollection implements ICollection {
  readonly presentationTarget = 'content' as const

  constructor(
    private readonly scopeKey: string,
    private readonly inner: ICollection,
  ) {}

  async buildIndex(route: SiteRouteDefinition): Promise<RouteViewBundle> {
    const bundle = await this.inner.buildIndex(route)
    return { ...bundle, viewKey: resolvePluginViewKey(this.scopeKey, route) }
  }

  async buildEntry(route: SiteRouteDefinition): Promise<RouteViewBundle> {
    const bundle = await this.inner.buildEntry(route)
    return { ...bundle, viewKey: resolvePluginViewKey(this.scopeKey, route) }
  }
}

export function createBuiltinDelegateCollection(
  site: DocsMintConfig,
  collectionKey: string,
  dateFormatter: Intl.DateTimeFormat,
): ICollection | undefined {
  if (isDocsCollectionKey(collectionKey)) {
    return undefined
  }
  const kind = site.collections?.[collectionKey]?.kind
  if (!isDocsMintCollectionKind(kind)) {
    return undefined
  }
  const inner =
    kind === 'writing'
      ? new WritingCollection(site, dateFormatter)
      : kind === 'page'
        ? new PageCollection(site)
        : new ContentCollection(site)
  return new BuiltinDelegateCollection(collectionKey, inner)
}

export class DocFormDelegateCollection implements ICollection {
  readonly presentationTarget = 'site-docs' as const

  constructor(
    private readonly formKey: string,
    private readonly inner: ICollection,
  ) {}

  async buildIndex(route: SiteRouteDefinition): Promise<RouteViewBundle> {
    const bundle = await this.inner.buildIndex(route)
    return { ...bundle, viewKey: resolvePluginViewKey(`form-${this.formKey}`, route) }
  }

  async buildEntry(route: SiteRouteDefinition): Promise<RouteViewBundle> {
    const bundle = await this.inner.buildEntry(route)
    return { ...bundle, viewKey: resolvePluginViewKey(`form-${this.formKey}`, route) }
  }
}
