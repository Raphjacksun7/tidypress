import {
  isDocsCollectionKey,
  isTidyPressCollectionKind,
  isSearchableCollectionKind,
  isStarterCollectionKey,
  resolveCapabilityFlags,
  type TidyPressCollectionKind,
  type TidyPressConfig,
} from '@tidypress/config'
import { withLocalePrefix } from '@/i18n/locale'
import { stripDocExtension } from '@/routing/versioning'

export type CollectionKind = 'docs' | TidyPressCollectionKind

export interface CollectionDefinition {
  key: string
  kind: CollectionKind
  enabled: boolean
  basePath?: string
  label: string
}

function getCollectionRecord(site: TidyPressConfig, key: string) {
  return site.collections?.[key]
}

function resolveInternalCollectionKind(key: string, kind: string | undefined): CollectionKind {
  if (isDocsCollectionKey(key)) {
    return 'docs'
  }
  if (isTidyPressCollectionKind(kind)) {
    return kind
  }
  throw new Error(
    `collections.${key}.kind is invalid or missing at runtime. Ensure config normalization ran before route planning.`,
  )
}

export function isCollectionEnabled(site: TidyPressConfig, key: string): boolean {
  const capabilityFlags = resolveCapabilityFlags(site)
  if (isStarterCollectionKey(key)) {
    return capabilityFlags[key]
  }
  const collection = getCollectionRecord(site, key)
  if (typeof collection?.enabled === 'boolean') {
    return collection.enabled
  }
  return false
}

export function getCollectionBasePath(site: TidyPressConfig, key: string): string {
  const basePath = getCollectionRecord(site, key)?.basePath
  return basePath ?? `/${key}`
}

export function getCollectionEntrySlug(entryId: string): string {
  return stripDocExtension(entryId)
}

export function getCollectionEntryPath(site: TidyPressConfig, key: string, entryId: string): string {
  return `${getCollectionBasePath(site, key)}/${getCollectionEntrySlug(entryId)}`
}

export function getLocalizedCollectionEntryPath(
  site: TidyPressConfig,
  key: string,
  entryId: string,
  locale?: string,
): string {
  return withLocalePrefix(getCollectionEntryPath(site, key, entryId), locale)
}

export function getLocalizedCollectionBasePath(
  site: TidyPressConfig,
  key: string,
  locale?: string,
): string {
  return withLocalePrefix(getCollectionBasePath(site, key), locale)
}

export function getEnabledCollections(site: TidyPressConfig): CollectionDefinition[] {
  const capabilityFlags = resolveCapabilityFlags(site)
  return Object.entries(site.collections ?? {})
    .map(([key, collection]) => {
      return {
        key,
        kind: resolveInternalCollectionKind(key, collection.kind),
        enabled: isStarterCollectionKey(key) ? capabilityFlags[key] : (collection.enabled ?? false),
        basePath: collection.basePath,
        label: collection.label ?? key,
      }
    })
    .filter(collection => collection.enabled)
}

export function getEnabledContentCollections(site: TidyPressConfig): CollectionDefinition[] {
  return getEnabledCollections(site).filter(collection =>
    isSearchableCollectionKind(collection.kind),
  )
}

export function shouldLocalizeCollection(site: TidyPressConfig, key: string): boolean {
  const locales = site.i18n?.locales?.filter(Boolean) ?? []
  return locales.length > 0 && isStarterCollectionKey(key)
}
