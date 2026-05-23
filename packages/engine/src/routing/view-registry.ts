import {
  defaultDocsMintDocForm,
  isDocsMintDocForm,
  type DocsMintDocForm,
  type DocsMintCollectionKind,
} from '@docsmint/config'
import type { SiteRouteMode } from '@/routing/types'
import { getPluginRouteViewDescriptors } from '@/plugins/manifest'

// ─── Collection Kind Targets ────────────────────────────────────────────────

export type CollectionPresentationTarget = DocsMintCollectionKind | 'site-docs'

// ─── View Modes ─────────────────────────────────────────────────────────────

export type CollectionRouteViewMode = 'collection-index' | 'collection-entry' | 'version-root'
export type CollectionShellLayout = 'docs' | 'writing' | 'page'

export function isCollectionRouteViewMode(mode: SiteRouteMode): mode is CollectionRouteViewMode {
  return mode === 'collection-index' || mode === 'collection-entry' || mode === 'version-root'
}

// ─── Built-in collection view registry ──────────────────────────────────────

export interface CollectionRouteViewDescriptor {
  readonly viewKey: string
  readonly requiresRenderedEntry: boolean
  readonly shell: boolean
}

type CollectionViewConfig = {
  readonly prefix: string
  readonly shellLayout: CollectionShellLayout
  readonly modes: Record<CollectionRouteViewMode, { readonly requiresRenderedEntry: boolean }>
}

export const collectionPresentationViewRegistry = {
  'site-docs': {
    prefix: 'docs',
    shellLayout: 'docs' as CollectionShellLayout,
    modes: {
      'collection-index': { requiresRenderedEntry: false },
      'collection-entry': { requiresRenderedEntry: true },
      'version-root': { requiresRenderedEntry: true },
    },
  },
  content: {
    prefix: 'content',
    shellLayout: 'docs' as CollectionShellLayout,
    modes: {
      'collection-index': { requiresRenderedEntry: false },
      'collection-entry': { requiresRenderedEntry: true },
      'version-root': { requiresRenderedEntry: true },
    },
  },
  writing: {
    prefix: 'writing',
    shellLayout: 'writing' as CollectionShellLayout,
    modes: {
      'collection-index': { requiresRenderedEntry: false },
      'collection-entry': { requiresRenderedEntry: true },
    },
  },
  page: {
    prefix: 'page',
    shellLayout: 'page' as CollectionShellLayout,
    modes: {
      'collection-index': { requiresRenderedEntry: false },
      'collection-entry': { requiresRenderedEntry: true },
    },
  },
} as const satisfies Record<CollectionPresentationTarget, CollectionViewConfig>

export function collectionViewKeyPrefix(target: CollectionPresentationTarget): string {
  return collectionPresentationViewRegistry[target].prefix
}

export function buildCollectionRouteViewDescriptors(): CollectionRouteViewDescriptor[] {
  const descriptors: CollectionRouteViewDescriptor[] = []
  for (const config of Object.values(collectionPresentationViewRegistry)) {
    for (const [mode, modeConfig] of Object.entries(config.modes)) {
      descriptors.push({
        viewKey: `${config.prefix}:${mode}`,
        requiresRenderedEntry: modeConfig.requiresRenderedEntry,
        shell: true,
      })
    }
  }
  return descriptors
}

export function buildCollectionRouteViewKey(
  target: CollectionPresentationTarget,
  route: { mode: SiteRouteMode },
): string {
  if (!isCollectionRouteViewMode(route.mode)) {
    throw new Error(
      `Route mode "${route.mode}" is not a collection view. Expected collection-index, collection-entry, or version-root.`,
    )
  }
  const config = collectionPresentationViewRegistry[target]
  if (!(route.mode in config.modes)) {
    throw new Error(`Presentation "${target}" does not support route mode "${route.mode}".`)
  }
  return `${config.prefix}:${route.mode}`
}

export function collectionShellLayoutForViewKey(viewKey: string): CollectionShellLayout | undefined {
  const prefix = viewKey.split(':')[0]
  for (const config of Object.values(collectionPresentationViewRegistry)) {
    if (config.prefix === prefix) {
      return config.shellLayout
    }
  }
  if (prefix === 'doc' || prefix === 'manual' || prefix.startsWith('form-')) {
    return 'docs'
  }
  return undefined
}

// ─── Doc Form View Registry ──────────────────────────────────────────────────

export const docFormEntryViewRegistry = {
  doc: {
    prefix: 'doc',
    shellLayout: 'docs' as CollectionShellLayout,
    modes: {
      'collection-entry': { requiresRenderedEntry: true },
      'version-root': { requiresRenderedEntry: true },
    },
  },
  manual: {
    prefix: 'manual',
    shellLayout: 'docs' as CollectionShellLayout,
    modes: {
      'collection-entry': { requiresRenderedEntry: true },
      'version-root': { requiresRenderedEntry: true },
    },
  },
} as const satisfies Record<
  DocsMintDocForm,
  {
    readonly prefix: string
    readonly shellLayout: CollectionShellLayout
    readonly modes: Record<CollectionRouteViewMode, { readonly requiresRenderedEntry: boolean }>
  }
>

export function buildDocFormEntryViewDescriptors(): CollectionRouteViewDescriptor[] {
  const descriptors: CollectionRouteViewDescriptor[] = []
  for (const config of Object.values(docFormEntryViewRegistry)) {
    for (const [mode, modeConfig] of Object.entries(config.modes)) {
      descriptors.push({
        viewKey: `${config.prefix}:${mode}`,
        requiresRenderedEntry: modeConfig.requiresRenderedEntry,
        shell: true,
      })
    }
  }
  return descriptors
}

export function presentationScopeToViewPrefix(scopeKey: string): string {
  if (scopeKey.startsWith('form:')) {
    return `form-${scopeKey.slice('form:'.length)}`
  }
  return scopeKey
}

export function resolveDocFormViewKey(
  form: string | undefined,
  route: { mode: SiteRouteMode },
): string {
  if (!isCollectionRouteViewMode(route.mode)) {
    throw new Error(
      `Route mode "${route.mode}" is not a collection view. Expected collection-index, collection-entry, or version-root.`,
    )
  }
  if (route.mode === 'collection-index') {
    return buildCollectionRouteViewKey('site-docs', route)
  }
  const entryForm = isDocsMintDocForm(form) ? form : defaultDocsMintDocForm
  const config = docFormEntryViewRegistry[entryForm]
  return `${config.prefix}:${route.mode}`
}

// ─── Route View Descriptor Map ───────────────────────────────────────────────

export interface RouteViewDescriptor {
  readonly viewKey: string
  readonly requiresRenderedEntry: boolean
  readonly shell: boolean
}

export const SITE_LOCALE_HOME_VIEW = 'site:locale-home'
export const PAGE_ROOT_VIEW = 'page:root-page'
export const SYSTEM_REDIRECT_VIEW = 'system:redirect'
export const SYSTEM_NOT_FOUND_VIEW = 'system:not-found'

const systemRouteViewDescriptors: RouteViewDescriptor[] = [
  { viewKey: SITE_LOCALE_HOME_VIEW, requiresRenderedEntry: false, shell: true },
  { viewKey: PAGE_ROOT_VIEW, requiresRenderedEntry: true, shell: true },
  { viewKey: SYSTEM_REDIRECT_VIEW, requiresRenderedEntry: false, shell: false },
  { viewKey: SYSTEM_NOT_FOUND_VIEW, requiresRenderedEntry: false, shell: false },
]

const builtinRouteViewDescriptors: RouteViewDescriptor[] = [
  ...systemRouteViewDescriptors,
  ...buildCollectionRouteViewDescriptors(),
  ...buildDocFormEntryViewDescriptors(),
]

export const ROUTE_VIEW_REGISTRY = builtinRouteViewDescriptors

export type RouteViewKey = string

const registryByKey = new Map<string, RouteViewDescriptor>(
  builtinRouteViewDescriptors.map(descriptor => [descriptor.viewKey, descriptor]),
)

let pluginRegistryLoaded = false
let pluginRegistryEpoch = -1

function clearPluginRouteDescriptors(): void {
  for (const key of [...registryByKey.keys()]) {
    if (!builtinRouteViewDescriptors.some(descriptor => descriptor.viewKey === key)) {
      registryByKey.delete(key)
    }
  }
}

export async function ensurePluginRouteViewRegistry(): Promise<void> {
  const epoch = import.meta.env.DEV ? (globalThis.__DOCSMINT_MANIFEST_EPOCH ?? 0) : 0
  if (pluginRegistryLoaded && pluginRegistryEpoch === epoch) {
    return
  }
  clearPluginRouteDescriptors()
  const pluginDescriptors = await getPluginRouteViewDescriptors()
  for (const descriptor of pluginDescriptors) {
    registryByKey.set(descriptor.viewKey, descriptor)
  }
  pluginRegistryLoaded = true
  pluginRegistryEpoch = epoch
}

export function getRouteViewDescriptor(viewKey: string): RouteViewDescriptor | undefined {
  return registryByKey.get(viewKey)
}

export function assertRegisteredViewKey(viewKey: string): asserts viewKey is RouteViewKey {
  if (!registryByKey.has(viewKey)) {
    throw new Error(
      `Unknown route view "${viewKey}". Register it in docsmint.config (render / extensions.docForms) and rebuild.`,
    )
  }
}

export function isRegisteredViewKey(viewKey: string): viewKey is RouteViewKey {
  return registryByKey.has(viewKey)
}

export function requiresRenderedEntry(viewKey: string): boolean {
  const descriptor = getRouteViewDescriptor(viewKey)
  if (!descriptor) {
    throw new Error(`Unknown route view "${viewKey}".`)
  }
  return descriptor.requiresRenderedEntry
}

export function listRouteViewKeys(): RouteViewKey[] {
  return [...registryByKey.keys()]
}

export function listShellViewKeys(): RouteViewKey[] {
  return [...registryByKey.values()]
    .filter(descriptor => descriptor.shell)
    .map(descriptor => descriptor.viewKey)
}

export function resolveCollectionRouteViewKey(
  target: CollectionPresentationTarget,
  route: { mode: SiteRouteMode },
): RouteViewKey {
  const viewKey = buildCollectionRouteViewKey(target, route)
  assertRegisteredViewKey(viewKey)
  return viewKey
}

export function resolveDocFormRouteViewKey(
  form: string | undefined,
  route: { mode: SiteRouteMode },
): RouteViewKey {
  const viewKey = resolveDocFormViewKey(form, route)
  assertRegisteredViewKey(viewKey)
  return viewKey
}

export function resolveShellLayoutForViewKey(
  viewKey: string,
  pluginLayouts: Record<string, CollectionShellLayout>,
): CollectionShellLayout | undefined {
  const prefix = viewKey.split(':')[0]
  if (pluginLayouts[prefix]) {
    return pluginLayouts[prefix]
  }
  return collectionShellLayoutForViewKey(viewKey)
}
