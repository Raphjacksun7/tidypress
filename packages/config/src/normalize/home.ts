import type { DocsMintHome, DocsMintHomePreset, DocsMintListDisplay } from '../display/list-display.js'

const homePresetDefaults: Record<DocsMintHomePreset, Partial<Pick<DocsMintHome, 'order' | 'collections'>>> = {
  lab: {
    order: ['writing', 'projects'],
    collections: {
      projects: { layout: 'card', showDescription: true },
    },
  },
  blog: {
    order: ['writing'],
  },
  'docs-writing': {
    order: ['writing', 'docs'],
  },
  persona: {
    order: ['projects', 'writing'],
    collections: {
      projects: { layout: 'card', showDescription: true },
    },
  },
}

function mergeHomeCollectionDisplay(
  preset?: Record<string, DocsMintListDisplay>,
  override?: Record<string, DocsMintListDisplay>,
): Record<string, DocsMintListDisplay> | undefined {
  if (!preset && !override) {
    return undefined
  }
  const keys = new Set([...Object.keys(preset ?? {}), ...Object.keys(override ?? {})])
  const merged: Record<string, DocsMintListDisplay> = {}
  for (const key of keys) {
    merged[key] = { ...preset?.[key], ...override?.[key] }
  }
  return merged
}

/**
 * Applies `home.preset` defaults for section order and per-collection display.
 * Explicit `home.order` and `home.collections` always win over preset defaults.
 * Does not change which collections are enabled — use `collections` and `capabilities` for that.
 */
export function normalizeHome(home?: DocsMintHome): DocsMintHome | undefined {
  if (!home) {
    return undefined
  }

  const { preset, ...rest } = home
  if (!preset) {
    return home
  }

  const defaults = homePresetDefaults[preset]
  return {
    ...rest,
    order: rest.order ?? defaults.order,
    collections: mergeHomeCollectionDisplay(defaults.collections, rest.collections),
    preset,
  }
}
