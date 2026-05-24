import type { CollectionShellLayout, RouteViewDescriptor } from '@/routing/view-registry'
import * as staticPluginManifest from '@/generated/docsmint-plugins.mjs'

declare global {
  // eslint-disable-next-line no-var
  var __DOCSMINT_MANIFEST_EPOCH: number | undefined
}

type GeneratedPluginManifest = {
  PLUGIN_ROUTE_VIEW_DESCRIPTORS?: RouteViewDescriptor[]
  PLUGIN_SHELL_LAYOUT_BY_PREFIX?: Record<string, CollectionShellLayout>
  PLUGIN_PRESENTATION_MODULES?: Record<string, string>
  PLUGIN_ASTRO_VIEW_IMPORTS?: Record<string, string>
  PLUGIN_DOC_FORM_KEYS?: string[]
}

let cachedManifest: GeneratedPluginManifest | null = null
let cachedEpoch = -1

async function loadGeneratedManifest(): Promise<GeneratedPluginManifest> {
  const epoch = import.meta.env.DEV ? (globalThis.__DOCSMINT_MANIFEST_EPOCH ?? 0) : 0
  if (!import.meta.env.DEV || epoch === 0) {
    return staticPluginManifest as GeneratedPluginManifest
  }
  if (cachedManifest && cachedEpoch === epoch) {
    return cachedManifest
  }
  const href = new URL('../../generated/docsmint-plugins.mjs', import.meta.url).href
  cachedManifest = (await import(/* @vite-ignore */ `${href}?t=${epoch}`)) as GeneratedPluginManifest
  cachedEpoch = epoch
  return cachedManifest
}

export async function getPluginRouteViewDescriptors(): Promise<RouteViewDescriptor[]> {
  const manifest = await loadGeneratedManifest()
  return manifest.PLUGIN_ROUTE_VIEW_DESCRIPTORS ?? []
}

export async function getPluginShellLayoutByPrefix(): Promise<Record<string, CollectionShellLayout>> {
  const manifest = await loadGeneratedManifest()
  return manifest.PLUGIN_SHELL_LAYOUT_BY_PREFIX ?? {}
}

export async function getPluginPresentationModules(): Promise<Record<string, string>> {
  const manifest = await loadGeneratedManifest()
  return manifest.PLUGIN_PRESENTATION_MODULES ?? {}
}

export async function getPluginAstroViewImports(): Promise<Record<string, string>> {
  const manifest = await loadGeneratedManifest()
  return manifest.PLUGIN_ASTRO_VIEW_IMPORTS ?? {}
}

export async function getPluginDocFormKeys(): Promise<string[]> {
  const manifest = await loadGeneratedManifest()
  return manifest.PLUGIN_DOC_FORM_KEYS ?? []
}
