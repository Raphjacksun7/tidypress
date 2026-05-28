import type { PublicationSurfaceDefinition } from '@tidypress/config'
import {
  collectionBasePath,
  publicationSurfaceDefinitions,
  publicationSurfaceFooterNavItems,
  publicationSurfaceHomeCollections,
  publicationSurfaceHomeOrder,
  publicationSurfaceNavHref,
  publicationSurfaceNavLabel,
  publicationSurfacePrimaryNavDefinitions,
} from '@tidypress/config'

/** @typedef {import('./starters.js').StarterCollection} StarterCollection */
/** @typedef {import('./starters.js').StarterSeedEntry} StarterSeedEntry */
/** @typedef {import('./starters.js').StarterPreset} StarterPreset */

/**
 * @param {string} key
 * @param {string} [label]
 */
export function starterNavItem(key, label = key) {
  return { label, href: collectionBasePath(key) }
}

/**
 * @param {string} label
 * @param {string} href
 */
export function starterNavLink(label, href) {
  return { label, href }
}

/**
 * @param {string} key
 * @param {{ kind?: 'content' | 'writing' | 'page' | 'projects', enabled: boolean, label?: string, basePath?: string }} options
 * @returns {StarterCollection}
 */
export function starterCollection(key, options) {
  const { kind, enabled, label, basePath } = options
  /** @type {StarterCollection} */
  const entry = {
    key,
    enabled,
    label: label ?? key,
    basePath: basePath ?? collectionBasePath(key),
    ...(kind !== undefined ? { kind } : {}),
  }
  return entry
}

/**
 * @param {readonly PublicationSurfaceDefinition[]} surfaces
 * @returns {StarterCollection[]}
 */
export function starterCollectionsFromSurfaces(surfaces) {
  return surfaces.map(surface => starterCollection(surface.key, { kind: surface.kind, enabled: true }))
}

/**
 * @param {readonly PublicationSurfaceDefinition[]} surfaces
 */
export function starterNavFromSurfaces(surfaces) {
  return surfaces.map(surface => ({
    label: publicationSurfaceNavLabel(surface),
    href: publicationSurfaceNavHref(surface),
  }))
}

/**
 * @param {Record<string, string>} seedBodies
 * @returns {StarterSeedEntry[]}
 */
export function starterSeedsFromBodies(seedBodies) {
  return Object.entries(seedBodies).map(([collection, body]) => {
    const [filePath, ...contentLines] = String(body).split('\n')
    return {
      collection,
      filePath: filePath.trim(),
      content: contentLines.join('\n').trimStart(),
    }
  })
}

const BODY_OF_WORK_DOCS_SEED = {
  collection: 'docs',
  filePath: 'getting-started.md',
  content: `---
title: Getting started
description: Product documentation starter page.
order: 1
---

Use the docs collection for tutorials, guides, and product documentation.
`,
}

/**
 * @param {string} presetKey
 * @param {string} siteDescription
 * @param {string} writingDescription
 * @param {Record<string, string>} seedBodies
 * @param {{ includeDocs?: boolean }} [options]
 * @returns {StarterPreset}
 */
export function buildBodyOfWorkPreset(
  presetKey,
  siteDescription,
  writingDescription,
  seedBodies,
  options?: { includeDocs?: boolean },
) {
  const { includeDocs = false } = options ?? {}
  const surfaces = publicationSurfaceDefinitions
  const primarySurfaces = publicationSurfacePrimaryNavDefinitions()
  const pagesSurface = surfaces.find(surface => surface.kind === 'page')
  const pageSlug =
    pagesSurface && 'pageSlug' in pagesSurface && pagesSurface.pageSlug
      ? pagesSurface.pageSlug
      : undefined
  const pageNavLabel =
    pagesSurface && 'pageNavLabel' in pagesSurface && pagesSurface.pageNavLabel
      ? pagesSurface.pageNavLabel
      : pageSlug

  return {
    key: presetKey,
    description: siteDescription,
    writingDescription,
    nav: [
      ...starterNavFromSurfaces(primarySurfaces),
      ...(includeDocs ? [starterNavItem('docs')] : []),
    ],
    footerLinks: publicationSurfaceFooterNavItems(),
    homeOrder: [...publicationSurfaceHomeOrder()],
    homeCollections: publicationSurfaceHomeCollections(),
    capabilitiesDisable: includeDocs ? [] : ['docs'],
    collections: [
      starterCollection('docs', { enabled: includeDocs }),
      ...starterCollectionsFromSurfaces(surfaces),
    ],
    pages: pageSlug ? [{ slug: pageSlug, navLabel: pageNavLabel ?? pageSlug }] : undefined,
    entries: [
      ...(includeDocs ? [BODY_OF_WORK_DOCS_SEED] : []),
      ...starterSeedsFromBodies(seedBodies),
    ],
  }
}
