import type { DocsMintConfig } from '../schema/index.js'
import { resolveCapabilityFlags } from '../registry/capabilities.js'
import { isPageCollectionKind } from '../registry/collection-kinds.js'
import {
  defaultHomePreviewSectionKeys,
  isLegacySectionKey,
  isStarterCollectionKey,
} from '../registry/legacy.js'

export type DocsMintListLayout = 'list' | 'card'
export type DocsMintListGap = 'sm' | 'md' | 'lg'

export const docsMintListGapRegistry = {
  sm: { stackClass: 'space-y-2' },
  md: { stackClass: 'space-y-3' },
  lg: { stackClass: 'space-y-6' },
} as const satisfies Record<DocsMintListGap, { stackClass: string }>

export const docsMintListLayoutRegistry = {
  list: {
    rowClass: 'home-list-row',
    titleClass: 'home-list-title',
    metaClass: 'home-list-meta',
    metaToneClass: 'text-zinc-400',
    titleDataAttr: 'data-entry-list-title',
  },
  card: {
    containerClass: 'flex flex-col',
    articleClass: 'entry-index-card',
    linkClass: 'group block',
    metaClass: 'entry-index-meta',
    titleClass: 'entry-index-title',
    descriptionClass: 'entry-index-description',
  },
} as const satisfies Record<
  DocsMintListLayout,
  Record<string, string>
>

export interface DocsMintListDisplay {
  layout?: DocsMintListLayout
  gap?: DocsMintListGap
  showDescription?: boolean
  showTags?: boolean
  /** Show the date (and author when present) on card and list entries. */
  showDate?: boolean
  icon?: string
}

export interface DocsMintHome {
  previewLimit?: number
  display?: DocsMintListDisplay
  collections?: Record<string, DocsMintListDisplay>
  order?: string[]
}

export interface DocsMintWritingEntryDisplay {
  showTags?: boolean
}

function isHomeCollectionEnabled(site: DocsMintConfig, key: string): boolean {
  const flags = resolveCapabilityFlags(site)
  if (isStarterCollectionKey(key)) {
    return flags[key as 'docs' | 'writing' | 'pages']
  }
  return site.collections?.[key]?.enabled === true
}

function isHomePreviewCollection(site: DocsMintConfig, key: string): boolean {
  if (!isHomeCollectionEnabled(site, key)) {
    return false
  }
  const kind = site.collections?.[key]?.kind
  if (kind && isPageCollectionKind(kind)) {
    return false
  }
  if (site.home?.collections?.[key]) {
    return true
  }
  if (isLegacySectionKey(key)) {
    return true
  }
  return kind === 'content'
}

export function resolveDefaultHomeSectionKeys(site: DocsMintConfig): string[] {
  const keys: string[] = []
  const seen = new Set<string>()

  for (const key of defaultHomePreviewSectionKeys) {
    if (isHomePreviewCollection(site, key)) {
      keys.push(key)
      seen.add(key)
    }
  }

  for (const key of Object.keys(site.collections ?? {})) {
    if (seen.has(key)) {
      continue
    }
    if (isHomePreviewCollection(site, key)) {
      keys.push(key)
      seen.add(key)
    }
  }

  return keys
}

export const defaultListDisplay: Required<Omit<DocsMintListDisplay, 'icon'>> = {
  layout: 'list',
  gap: 'sm',
  showDescription: false,
  showTags: false,
  showDate: false,
}

export function mergeListDisplay(
  ...layers: Array<DocsMintListDisplay | undefined>
): Required<Omit<DocsMintListDisplay, 'icon'>> & Pick<DocsMintListDisplay, 'icon'> {
  const merged: Required<Omit<DocsMintListDisplay, 'icon'>> & Pick<DocsMintListDisplay, 'icon'> = {
    ...defaultListDisplay,
    icon: undefined,
  }
  for (const layer of layers) {
    if (!layer) {
      continue
    }
    if (layer.layout) {
      merged.layout = layer.layout
    }
    if (layer.gap) {
      merged.gap = layer.gap
    }
    if (typeof layer.showDescription === 'boolean') {
      merged.showDescription = layer.showDescription
    }
    if (typeof layer.showTags === 'boolean') {
      merged.showTags = layer.showTags
    }
    if (typeof layer.showDate === 'boolean') {
      merged.showDate = layer.showDate
    }
    if (layer.icon) {
      merged.icon = layer.icon
    }
  }
  return merged
}

export function resolveHomeCollectionDisplay(
  home: DocsMintHome | undefined,
  collectionDisplay: DocsMintListDisplay | undefined,
  homeCollectionDisplay: DocsMintListDisplay | undefined,
): ReturnType<typeof mergeListDisplay> {
  const resolved = mergeListDisplay(home?.display, collectionDisplay, homeCollectionDisplay)
  const hasHomeDescriptionSetting =
    typeof home?.display?.showDescription === 'boolean' ||
    typeof homeCollectionDisplay?.showDescription === 'boolean'
  if (!hasHomeDescriptionSetting) {
    resolved.showDescription = false
  }
  return resolved
}

export function resolveCollectionIndexDisplay(
  collectionDisplay: DocsMintListDisplay | undefined,
): ReturnType<typeof mergeListDisplay> {
  return mergeListDisplay(collectionDisplay)
}

export type ResolvedListDisplay = ReturnType<typeof mergeListDisplay>

export function listGapStackClass(gap: DocsMintListGap): string {
  return docsMintListGapRegistry[gap].stackClass
}

export function listLayoutPresentation(layout: DocsMintListLayout) {
  return docsMintListLayoutRegistry[layout]
}

export function isCardListLayout(layout: DocsMintListLayout): boolean {
  return layout === 'card'
}
