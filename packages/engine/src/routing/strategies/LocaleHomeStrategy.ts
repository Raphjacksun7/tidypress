import type { DocsMintConfig } from '@docsmint/config'
import { RoutePath } from '@/routing/RoutePath'
import { defineRoute, nonDefaultLocales, resolveRoutePolicy } from '@/routing/route-planning'
import type { SiteRouteDefinition } from '@/routing/types'

export class LocaleHomeStrategy {
  plan(site: DocsMintConfig): SiteRouteDefinition[] {
    const policy = resolveRoutePolicy(site)
    return nonDefaultLocales(policy).map(locale =>
      defineRoute(new RoutePath([locale]), {
        mode: 'locale-home',
        locale,
      }),
    )
  }
}
