import type { DocsMintCollections, DocsMintConfig } from './schema.js'
import { getLegacySectionForCollection, legacySectionKeys, starterCollectionKeys } from './legacy.js'

export interface SectionsMigrationOptions {
  preserveSections?: boolean
}

export interface SectionsMigrationResult {
  migrated: boolean
  config: DocsMintConfig
  notes: string[]
}

function orderCollections(collections: DocsMintCollections): DocsMintCollections {
  const orderedEntries: Array<[string, DocsMintCollections[string]]> = []
  const added = new Set<string>()
  for (const starter of starterCollectionKeys) {
    if (!collections[starter]) {
      continue
    }
    orderedEntries.push([starter, collections[starter]])
    added.add(starter)
  }
  for (const [key, value] of Object.entries(collections)) {
    if (added.has(key)) {
      continue
    }
    orderedEntries.push([key, value])
  }
  return Object.fromEntries(orderedEntries)
}

export function migrateSectionsToCollections(
  config: DocsMintConfig,
  options: SectionsMigrationOptions = {},
): SectionsMigrationResult {
  const sections = config.sections
  const existingCollections = config.collections ?? {}
  if (!sections) {
    return {
      migrated: false,
      config,
      notes: ['No sections key found; no migration needed.'],
    }
  }

  let touched = false
  const notes: string[] = []
  const nextCollections: DocsMintCollections = {
    ...existingCollections,
  }

  for (const key of legacySectionKeys) {
    const legacyValue = getLegacySectionForCollection(sections, key)
    if (!legacyValue) {
      continue
    }
    if (existingCollections[key]) {
      notes.push(`Kept collections.${key} and ignored legacy sections.${key}.`)
      continue
    }
    nextCollections[key] = {
      ...legacyValue,
      kind: key,
      label: key,
    }
    touched = true
    notes.push(`Migrated sections.${key} into collections.${key}.`)
  }

  const preserveSections = options.preserveSections === true
  const nextConfig: DocsMintConfig = {
    ...config,
    collections: orderCollections(nextCollections),
    ...(preserveSections ? {} : { sections: undefined }),
  }
  if (!preserveSections && sections) {
    touched = true
    notes.push('Removed legacy sections key from migrated output.')
  }

  return {
    migrated: touched,
    config: nextConfig,
    notes,
  }
}

