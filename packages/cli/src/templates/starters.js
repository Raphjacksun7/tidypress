/**
 * @typedef {{ key: string, kind: 'docs' | 'writing' | 'page', enabled: boolean, basePath?: string, label?: string }} StarterCollection
 * @typedef {{ collection: string, filePath: string, content: string }} StarterSeedEntry
 * @typedef {{
 *   key: string
 *   description: string
 *   writingDescription: string
 *   nav: Array<{ label: string, href: string }>
 *   collections: StarterCollection[]
 *   entries: StarterSeedEntry[]
 * }} StarterPreset
 */

/** @type {Record<string, StarterPreset>} */
export const STARTER_PRESETS = {
  default: {
    key: 'default',
    description: 'Minimal markdown docs and writing.',
    writingDescription: 'Engineering notes, architectural decisions, and observations.',
    nav: [
      { label: 'docs', href: '/docs' },
      { label: 'writing', href: '/writing' },
    ],
    collections: [
      { key: 'docs', kind: 'docs', enabled: true, basePath: '/docs', label: 'docs' },
      { key: 'writing', kind: 'writing', enabled: true, basePath: '/writing', label: 'writing' },
      { key: 'pages', kind: 'page', enabled: true, label: 'pages' },
    ],
    entries: [
      {
        collection: 'docs',
        filePath: 'getting-started.md',
        content: `---
title: Getting started
description: Welcome to DocsMint.
order: 1
---

Welcome to DocsMint. Edit this page at \`docs/src/content/docs/getting-started.md\`.
`,
      },
      {
        collection: 'writing',
        filePath: 'hello.md',
        content: `---
title: Hello
description: First writing entry.
date: 2026-01-01
---

This is your first writing post.
`,
      },
    ],
  },
}

export const DEFAULT_STARTER_PRESET = 'default'

/**
 * @param {string | undefined} requestedPreset
 * @returns {StarterPreset}
 */
export function resolveStarterPreset(requestedPreset) {
  const preset = requestedPreset ?? DEFAULT_STARTER_PRESET
  const match = STARTER_PRESETS[preset]
  if (!match) {
    const supported = Object.keys(STARTER_PRESETS).join(', ')
    throw new Error(`Unknown starter preset "${preset}". Supported presets: ${supported}.`)
  }
  return match
}
