import { collectionMetaIndexSlug } from '@docsmint/config'
import type { SiteRouteDefinition } from '@/routing/types'
import { RoutePath } from '@/routing/RoutePath'
import { defineRoute } from '@/routing/route-planning'

export function collectCollectionTags(
  entries: Array<{ data: Record<string, unknown> }>,
): string[] {
  const tags = new Set<string>()
  for (const entry of entries) {
    for (const tag of (entry.data.tags as string[] | undefined) ?? []) {
      tags.add(tag)
    }
  }
  return [...tags].sort((a, b) => a.localeCompare(b))
}

export function planCollectionTagRoutes(
  base: RoutePath,
  collectionKey: string,
  entries: Array<{ data: Record<string, unknown> }>,
  locale?: string,
): SiteRouteDefinition[] {
  const routes: SiteRouteDefinition[] = []
  const localizedBase = locale ? base.withLocale(locale) : base

  for (const tag of collectCollectionTags(entries)) {
    const slug = collectionMetaIndexSlug('tags', tag)
    routes.push(
      defineRoute(localizedBase.append(slug), {
        mode: 'collection-index',
        collectionKey,
        locale,
        slug,
      }),
    )
  }

  return routes
}
