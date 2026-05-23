import { defaultConfig } from '../defaults.js'
import {
  formatDocsMintCollectionKinds,
  isDocsMintCollectionKind,
} from '../registry/collection-kinds.js'
import { validateCollectionRender } from '../registry/collection-render.js'
import {
  getLegacySectionForCollection,
  inferStarterCollectionKind,
  isDocsCollectionKey,
  isLegacySectionKey,
  isReservedDocsKind,
  starterCollectionKeys,
} from '../registry/legacy.js'
import type {
  DocsMintCapabilityName,
  DocsMintCollectionKind,
  DocsMintCollections,
  DocsMintConfig,
  DocsMintSections,
} from '../schema/index.js'

function resolveCollectionKindForKey(
  key: string,
  configured: DocsMintCollections[string],
  preset: DocsMintCollections[string],
): DocsMintCollectionKind | undefined {
  const explicitKind = configured?.kind ?? preset?.kind
  if (isReservedDocsKind(explicitKind)) {
    throw new Error(
      `collections.${key}: kind "docs" is not allowed. Use the docs collection for product documentation, or kind "content" for other reference collections.`,
    )
  }
  if (isDocsCollectionKey(key)) {
    if (explicitKind) {
      throw new Error('collections.docs must not set kind. The docs collection is always documentation.')
    }
    return undefined
  }
  const resolved = explicitKind ?? inferStarterCollectionKind(key)
  if (!isDocsMintCollectionKind(resolved)) {
    throw new Error(
      `collections.${key}.kind is required. Use one of: ${formatDocsMintCollectionKinds()}.`,
    )
  }
  return resolved
}

export function normalizeCollections(config: DocsMintConfig): DocsMintCollections {
  const defaults = defaultConfig.collections ?? {}
  const collections = config.collections ?? {}
  const sections = config.sections ?? {}
  const normalized: DocsMintCollections = {}
  const keys = new Set<string>([
    ...Object.keys(defaults),
    ...Object.keys(collections),
    ...starterCollectionKeys,
  ])

  for (const key of keys) {
    const preset = defaults[key] ?? {}
    const configured = collections[key] ?? {}
    const legacySection = getLegacySectionForCollection(sections, key)
    const shouldApplySectionShim = isLegacySectionKey(key) && !collections[key]
    const resolvedKind = resolveCollectionKindForKey(key, configured, preset)
    const render = configured.render ?? preset.render
    validateCollectionRender(key, render)
    if (isDocsCollectionKey(key) && render) {
      throw new Error(
        'collections.docs cannot set render. Use form in docs frontmatter, or add a separate collection with render.',
      )
    }
    normalized[key] = {
      ...preset,
      ...configured,
      ...(shouldApplySectionShim ? legacySection : {}),
      ...(resolvedKind ? { kind: resolvedKind } : {}),
      ...(render ? { render } : {}),
    }
  }

  for (const [key, collection] of Object.entries(normalized)) {
    const basePath = collection?.basePath
    if (!basePath) {
      continue
    }
    if (!basePath.startsWith('/') || basePath.includes(' ')) {
      throw new Error(`collections.${key}.basePath must be an absolute path like "/docs".`)
    }
    if (basePath.length > 1 && basePath.endsWith('/')) {
      throw new Error(`collections.${key}.basePath must not end with "/" (got "${basePath}").`)
    }
  }

  const usedBasePaths = new Map<string, string>()
  for (const [key, collection] of Object.entries(normalized)) {
    if (!collection?.enabled || !collection.basePath) {
      continue
    }
    const conflict = usedBasePaths.get(collection.basePath)
    if (conflict) {
      throw new Error(`collections.${key}.basePath conflicts with collections.${conflict}.basePath "${collection.basePath}".`)
    }
    usedBasePaths.set(collection.basePath, key)
  }

  return normalized
}

export function deriveSectionsFromCollections(collections: DocsMintCollections): DocsMintSections {
  const docs = collections.docs
  const writing = collections.writing
  return {
    docs: {
      enabled: docs?.enabled,
      basePath: docs?.basePath,
    },
    writing: {
      enabled: writing?.enabled,
      basePath: writing?.basePath,
    },
  }
}

export function applyStarterCapabilityOverrides(
  collections: DocsMintCollections,
  flags: Partial<Record<DocsMintCapabilityName, boolean>>,
): DocsMintCollections {
  const next = { ...collections }
  for (const key of starterCollectionKeys) {
    if (!next[key]) {
      continue
    }
    next[key] = {
      ...next[key],
      enabled: flags[key] ?? next[key].enabled,
    }
  }
  return next
}
