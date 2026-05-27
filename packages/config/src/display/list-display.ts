import type { TidyPressConfig } from '../schema/index.js'
import { resolveCapabilityFlags } from '../registry/capabilities.js'
import { isPageCollectionKind } from '../registry/collection-kinds.js'
import {
  defaultHomePreviewSectionKeys,
  isLegacySectionKey,
  isStarterCollectionKey,
} from '../registry/legacy.js'

export type TidyPressListLayout = 'list' | 'card'
export type TidyPressListGap = 'sm' | 'md' | 'lg'

export const tidyPressListGapRegistry = {
  sm: { stackClass: 'space-y-2' },
  md: { stackClass: 'space-y-3' },
  lg: { stackClass: 'space-y-6' },
} as const satisfies Record<TidyPressListGap, { stackClass: string }>

export const tidyPressListLayoutRegistry = {
  list: {
    rowClass: 'home-list-row',
    titleClass: 'home-list-title',
    metaClass: 'home-list-meta',
    titleDataAttr: 'data-entry-list-title',
  },
  card: {
    containerClass: 'flex flex-col',
    articleClass: 'entry-index-card',
    linkClass: 'group block',
    statusClass: 'entry-index-status',
    metaClass: 'entry-index-meta',
    titleClass: 'entry-index-title',
    descriptionClass: 'entry-index-description',
  },
} as const satisfies Record<
  TidyPressListLayout,
  Record<string, string>
>

export const tidyPressHomePreviewPresentation = {
  sectionClass: 'space-y-3',
  cardLinkClass: 'group home-card-row dm-link-unstyled',
  cardContentClass: 'min-w-0',
  cardTitleClass: 'home-card-title',
  cardDescriptionClass: 'home-card-description',
  cardMetaClass: 'home-card-meta',
  listLinkClass: 'group dm-link-unstyled',
  listTitleDataAttr: 'data-writing-title',
  /** Responsive visibility lives in engine global.css (`.home-list-description`). */
  listDescriptionClass: 'home-list-description',
  moreWrapperClass: 'pt-1',
  moreLinkClass: 'text-xs',
} as const

export const tidyPressCollectionIndexPresentation = {
  listLinkClass: 'group dm-link-unstyled',
} as const

export interface TidyPressListDisplay {
  layout?: TidyPressListLayout
  gap?: TidyPressListGap
  showDescription?: boolean
  showTags?: boolean
  /** Show the date (and author when present) on card and list entries. */
  showDate?: boolean
  icon?: string
}

export type TidyPressHomePreset = 'lab' | 'blog' | 'docs-writing' | 'persona'

export interface TidyPressHome {
  previewLimit?: number
  display?: TidyPressListDisplay
  collections?: Record<string, TidyPressListDisplay>
  order?: string[]
  preset?: TidyPressHomePreset
}

export interface TidyPressWritingEntryDisplay {
  showTags?: boolean
}

function isHomeCollectionEnabled(site: TidyPressConfig, key: string): boolean {
  const flags = resolveCapabilityFlags(site)
  if (isStarterCollectionKey(key)) {
    return flags[key as 'docs' | 'writing' | 'pages']
  }
  return site.collections?.[key]?.enabled === true
}

function isHomePreviewCollection(site: TidyPressConfig, key: string): boolean {
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
  return kind === 'content' || kind === 'projects'
}

export function resolveDefaultHomeSectionKeys(site: TidyPressConfig): string[] {
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

export const defaultListDisplay: Required<Omit<TidyPressListDisplay, 'icon'>> = {
  layout: 'list',
  gap: 'sm',
  showDescription: false,
  showTags: false,
  showDate: false,
}

export function mergeListDisplay(
  ...layers: Array<TidyPressListDisplay | undefined>
): Required<Omit<TidyPressListDisplay, 'icon'>> & Pick<TidyPressListDisplay, 'icon'> {
  const merged: Required<Omit<TidyPressListDisplay, 'icon'>> & Pick<TidyPressListDisplay, 'icon'> = {
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
  home: TidyPressHome | undefined,
  collectionDisplay: TidyPressListDisplay | undefined,
  homeCollectionDisplay: TidyPressListDisplay | undefined,
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
  collectionDisplay: TidyPressListDisplay | undefined,
): ReturnType<typeof mergeListDisplay> {
  return mergeListDisplay(collectionDisplay)
}

export type ResolvedListDisplay = ReturnType<typeof mergeListDisplay>

export function listGapStackClass(gap: TidyPressListGap): string {
  return tidyPressListGapRegistry[gap].stackClass
}

export function listLayoutPresentation<T extends TidyPressListLayout>(
  layout: T,
): (typeof tidyPressListLayoutRegistry)[T] {
  return tidyPressListLayoutRegistry[layout]
}

export function isCardListLayout(layout: TidyPressListLayout): boolean {
  return layout === 'card'
}
