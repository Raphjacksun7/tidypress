import {
  isDocsCollectionKey,
  isDocsMintCollectionKind,
  isSearchableCollectionKind,
  isStarterCollectionKey,
  resolveCapabilityFlags,
  type DocsMintCollectionKind,
  type DocsMintConfig,
} from '@docsmint/config'
import { withLocalePrefix } from '@/i18n/locale'
import { stripDocExtension } from '@/routing/versioning'

export type CollectionKind = 'docs' | DocsMintCollectionKind

export interface CollectionDefinition {
  key: string
  kind: CollectionKind
  enabled: boolean
  basePath?: string
  label: string
}

function getCollectionRecord(site: DocsMintConfig, key: string) {
  return site.collections?.[key]
}

function resolveInternalCollectionKind(key: string, kind: string | undefined): CollectionKind {
  if (isDocsCollectionKey(key)) {
    return 'docs'
  }
  if (isDocsMintCollectionKind(kind)) {
    return kind
  }
  throw new Error(
    `collections.${key}.kind is invalid or missing at runtime. Ensure config normalization ran before route planning.`,
  )
}

export function isCollectionEnabled(site: DocsMintConfig, key: string): boolean {
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

export function getCollectionBasePath(site: DocsMintConfig, key: string): string {
  const basePath = getCollectionRecord(site, key)?.basePath
  return basePath ?? `/${key}`
}

export function getCollectionEntrySlug(entryId: string): string {
  return stripDocExtension(entryId)
}

export function getCollectionEntryPath(site: DocsMintConfig, key: string, entryId: string): string {
  return `${getCollectionBasePath(site, key)}/${getCollectionEntrySlug(entryId)}`
}

export function getLocalizedCollectionEntryPath(
  site: DocsMintConfig,
  key: string,
  entryId: string,
  locale?: string,
): string {
  return withLocalePrefix(getCollectionEntryPath(site, key, entryId), locale)
}

export function getLocalizedCollectionBasePath(
  site: DocsMintConfig,
  key: string,
  locale?: string,
): string {
  return withLocalePrefix(getCollectionBasePath(site, key), locale)
}

export function getEnabledCollections(site: DocsMintConfig): CollectionDefinition[] {
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

export function getEnabledContentCollections(site: DocsMintConfig): CollectionDefinition[] {
  return getEnabledCollections(site).filter(collection =>
    isSearchableCollectionKind(collection.kind),
  )
}

export function shouldLocalizeCollection(site: DocsMintConfig, key: string): boolean {
  const locales = site.i18n?.locales?.filter(Boolean) ?? []
  return locales.length > 0 && isStarterCollectionKey(key)
}
