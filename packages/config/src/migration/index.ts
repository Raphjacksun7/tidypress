import type { TidyPressCollections, TidyPressConfig } from '../schema/index.js'
import {
  getLegacySectionForCollection,
  inferStarterCollectionKind,
  legacySectionKeys,
  starterCollectionKeys,
} from '../registry/legacy.js'

export interface SectionsMigrationOptions {
  preserveSections?: boolean
}

export interface SectionsMigrationResult {
  migrated: boolean
  config: TidyPressConfig
  notes: string[]
}

function orderCollections(collections: TidyPressCollections): TidyPressCollections {
  const orderedEntries: Array<[string, TidyPressCollections[string]]> = []
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
  config: TidyPressConfig,
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
  const nextCollections: TidyPressCollections = {
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
    const kind = inferStarterCollectionKind(key)
    nextCollections[key] = {
      ...legacyValue,
      ...(kind ? { kind } : {}),
      label: key,
    }
    touched = true
    notes.push(`Migrated sections.${key} into collections.${key}.`)
  }

  const preserveSections = options.preserveSections === true
  const nextConfig: TidyPressConfig = {
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

