import path from 'node:path'
import { pathToFileURL } from 'node:url'
import type { TidyPressConfig } from '@tidypress/config'
import type { TidyPressPluginPresentation, TidyPressPluginPresentationFactory } from '@/plugins/contracts'
import type { ICollection } from '@/collections/ICollection'
import type { SiteRouteDefinition } from '@/routing/types'
import type { RouteViewBundle } from '@/collections/bundle'
import { isCollectionRouteViewMode, presentationScopeToViewPrefix } from '@/routing/view-registry'

function resolvePluginViewKey(scopeKey: string, route: SiteRouteDefinition): string {
  if (!isCollectionRouteViewMode(route.mode)) {
    throw new Error(`Route mode "${route.mode}" is not a collection view.`)
  }
  return `${presentationScopeToViewPrefix(scopeKey)}:${route.mode}`
}

class PluginCollection implements ICollection {
  readonly presentationTarget = 'content' as const

  constructor(
    private readonly site: TidyPressConfig,
    private readonly scopeKey: string,
    private readonly delegate: TidyPressPluginPresentation,
  ) {}

  async buildIndex(route: SiteRouteDefinition): Promise<RouteViewBundle> {
    const bundle = await this.delegate.buildIndex(route)
    return { ...bundle, viewKey: resolvePluginViewKey(this.scopeKey, route) }
  }

  async buildEntry(route: SiteRouteDefinition): Promise<RouteViewBundle> {
    const bundle = await this.delegate.buildEntry(route)
    return { ...bundle, viewKey: resolvePluginViewKey(this.scopeKey, route) }
  }
}

async function importPresentationModule(
  projectRoot: string,
  modulePath: string,
): Promise<TidyPressPluginPresentationFactory> {
  const projectRelative = modulePath.replace(/^\.\//, '')
  const loaded = import.meta.env.DEV
    ? await import(`@project/${projectRelative}`)
    : await import(/* @vite-ignore */ pathToFileURL(path.resolve(projectRoot, projectRelative)).href)
  const factory =
    (loaded.createPresentation as TidyPressPluginPresentationFactory | undefined) ??
    (loaded.default as TidyPressPluginPresentationFactory | undefined)
  if (typeof factory !== 'function') {
    throw new Error(
      `Plugin module "${modulePath}" must export createPresentation(site, context) or a default factory function.`,
    )
  }
  return factory
}

export async function loadPluginPresentations(
  site: TidyPressConfig,
  projectRoot: string,
  modules: Record<string, string>,
): Promise<Map<string, ICollection>> {
  const presentations = new Map<string, ICollection>()
  if (!projectRoot) {
    return presentations
  }

  for (const [scopeKey, modulePath] of Object.entries(modules)) {
    const collectionKey = scopeKey.startsWith('form:') ? 'docs' : scopeKey
    const factory = await importPresentationModule(projectRoot, modulePath)
    const delegate = await factory(site, { collectionKey })
    presentations.set(scopeKey, new PluginCollection(site, scopeKey, delegate))
  }

  return presentations
}
