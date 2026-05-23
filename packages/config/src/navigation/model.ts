import { defaultConfig } from '../defaults.js'
import type { DocsMintConfig, NavItem } from '../schema/index.js'
import { withDefaults } from '../normalize/with-defaults.js'

function pickVisible(nav: NavItem[], limit: number): { visible: NavItem[]; overflow: NavItem[] } {
  const core = nav.filter(item => item.priority === 'core')
  const secondary = nav.filter(item => item.priority !== 'core')
  const selected = new Set<NavItem>()

  for (const item of core) {
    if (selected.size >= limit) {
      break
    }
    selected.add(item)
  }
  for (const item of secondary) {
    if (selected.size >= limit) {
      break
    }
    selected.add(item)
  }

  const visible = nav.filter(item => selected.has(item))
  const overflow = nav.filter(item => !selected.has(item))
  return { visible, overflow }
}

export function buildNavigationModel(config: DocsMintConfig): {
  desktop: { visible: NavItem[]; overflow: NavItem[] }
  mobile: { visible: NavItem[]; overflow: NavItem[] }
} {
  const safeConfig = withDefaults(config)
  const nav = safeConfig.nav ?? []
  const navPolicy = safeConfig.navPolicy ?? defaultConfig.navPolicy
  const desktopLimit = navPolicy?.maxVisibleDesktop ?? 3
  const mobileLimit = navPolicy?.maxVisibleMobile ?? 2
  return {
    desktop: pickVisible(nav, desktopLimit),
    mobile: pickVisible(nav, mobileLimit),
  }
}
