import type { TidyPressCapabilities, TidyPressCapabilityName, TidyPressConfig } from '../schema/index.js'
import { isStarterCollectionKey } from './legacy.js'

export type TidyPressCapabilityLifecycle = 'stable' | 'experimental'
export type TidyPressCapabilityScope = 'collection' | 'feature'
export type TidyPressCapabilitySource =
  | 'default'
  | 'config'
  | 'config-capability-disable'
  | 'config-capability-enable'
  | 'override-disable'
  | 'override-enable'

export interface TidyPressCapabilityDescriptor {
  key: TidyPressCapabilityName
  scope: TidyPressCapabilityScope
  lifecycle: TidyPressCapabilityLifecycle
  defaultEnabled: boolean
}

export const capabilityRegistry = [
  { key: 'docs', scope: 'collection', lifecycle: 'stable', defaultEnabled: true },
  { key: 'writing', scope: 'collection', lifecycle: 'stable', defaultEnabled: true },
  { key: 'pages', scope: 'collection', lifecycle: 'stable', defaultEnabled: true },
  { key: 'editor', scope: 'feature', lifecycle: 'experimental', defaultEnabled: false },
  { key: 'export', scope: 'feature', lifecycle: 'experimental', defaultEnabled: false },
  { key: 'ai', scope: 'feature', lifecycle: 'experimental', defaultEnabled: false },
  { key: 'theming', scope: 'feature', lifecycle: 'stable', defaultEnabled: true },
  { key: 'themingCustom', scope: 'feature', lifecycle: 'stable', defaultEnabled: false },
  { key: 'llmsTxt', scope: 'feature', lifecycle: 'stable', defaultEnabled: true },
] as const satisfies readonly TidyPressCapabilityDescriptor[]

export type TidyPressCapabilityKey = (typeof capabilityRegistry)[number]['key']

export interface ResolvedCapabilityState {
  enabled: boolean
  source: TidyPressCapabilitySource
}

export type ResolvedCapabilityMap = Record<TidyPressCapabilityKey, ResolvedCapabilityState>
export type ResolvedCapabilityFlags = Record<TidyPressCapabilityKey, boolean>

export interface ResolveCapabilitiesOptions {
  enable?: string[]
  disable?: string[]
}

function knownCapabilityKeys(): TidyPressCapabilityKey[] {
  return capabilityRegistry.map(descriptor => descriptor.key)
}

function normalizeCapabilityList(value: string[] | undefined): string[] {
  if (!value) {
    return []
  }
  return Array.from(
    new Set(
      value
        .map(item => item.trim())
        .filter(Boolean),
    ),
  )
}

function assertKnownCapabilities(entries: string[], field: 'enable' | 'disable'): void {
  const known = new Set(knownCapabilityKeys())
  const unknown = entries.filter(entry => !known.has(entry as TidyPressCapabilityKey))
  if (unknown.length === 0) {
    return
  }
  throw new Error(
    `capabilities.${field} contains unknown capability key(s): ${unknown.join(', ')}. ` +
      `Known keys: ${knownCapabilityKeys().join(', ')}.`,
  )
}

export function normalizeCapabilities(config: TidyPressConfig): TidyPressCapabilities {
  const enable = normalizeCapabilityList(config.capabilities?.enable)
  const disable = normalizeCapabilityList(config.capabilities?.disable)

  assertKnownCapabilities(enable, 'enable')
  assertKnownCapabilities(disable, 'disable')

  const overlap = enable.filter(key => disable.includes(key))
  if (overlap.length > 0) {
    throw new Error(`capabilities.enable/disable overlap on: ${overlap.join(', ')}.`)
  }

  return {
    enable: enable.length > 0 ? (enable as TidyPressCapabilityKey[]) : undefined,
    disable: disable.length > 0 ? (disable as TidyPressCapabilityKey[]) : undefined,
  }
}

function getConfigCapabilityValue(config: TidyPressConfig, key: TidyPressCapabilityKey): boolean | undefined {
  if (isStarterCollectionKey(key)) {
    return config.collections?.[key]?.enabled
  }
  if (key === 'editor' || key === 'export' || key === 'ai') {
    return config.experimental?.[key]
  }
  return undefined
}

export function resolveCapabilities(
  config: TidyPressConfig,
  options: ResolveCapabilitiesOptions = {},
): ResolvedCapabilityMap {
  const state = Object.create(null) as ResolvedCapabilityMap

  for (const descriptor of capabilityRegistry) {
    const configuredValue = getConfigCapabilityValue(config, descriptor.key)
    if (typeof configuredValue === 'boolean') {
      state[descriptor.key] = { enabled: configuredValue, source: 'config' }
      continue
    }
    state[descriptor.key] = { enabled: descriptor.defaultEnabled, source: 'default' }
  }

  const normalizedConfigCapabilities = normalizeCapabilities(config)
  const configDisable = normalizedConfigCapabilities.disable ?? []
  const configEnable = normalizedConfigCapabilities.enable ?? []
  for (const key of configDisable) {
    state[key].enabled = false
    state[key].source = 'config-capability-disable'
  }
  for (const key of configEnable) {
    state[key].enabled = true
    state[key].source = 'config-capability-enable'
  }

  const overrideEnable = normalizeCapabilityList(options.enable)
  const overrideDisable = normalizeCapabilityList(options.disable)
  assertKnownCapabilities(overrideEnable, 'enable')
  assertKnownCapabilities(overrideDisable, 'disable')

  const overlap = overrideEnable.filter(key => overrideDisable.includes(key))
  if (overlap.length > 0) {
    throw new Error(`Capability overrides overlap on: ${overlap.join(', ')}.`)
  }

  for (const key of overrideDisable) {
    const capabilityKey = key as TidyPressCapabilityKey
    state[capabilityKey].enabled = false
    state[capabilityKey].source = 'override-disable'
  }
  for (const key of overrideEnable) {
    const capabilityKey = key as TidyPressCapabilityKey
    state[capabilityKey].enabled = true
    state[capabilityKey].source = 'override-enable'
  }

  return state
}

export function resolveCapabilityFlags(
  config: TidyPressConfig,
  options: ResolveCapabilitiesOptions = {},
): ResolvedCapabilityFlags {
  const resolved = resolveCapabilities(config, options)
  return Object.fromEntries(
    Object.entries(resolved).map(([key, value]) => [key, value.enabled]),
  ) as ResolvedCapabilityFlags
}

export function isCapabilityEnabled(
  config: TidyPressConfig,
  key: TidyPressCapabilityKey,
  options: ResolveCapabilitiesOptions = {},
): boolean {
  return resolveCapabilityFlags(config, options)[key]
}
