/**
 * @typedef {{ key: string, kind?: 'content' | 'writing' | 'page', enabled: boolean, basePath?: string, label?: string }} StarterCollection
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
    writingDescription: 'Notes, updates, and longer writing.',
    nav: [
      { label: 'docs', href: '/docs' },
      { label: 'writing', href: '/writing' },
    ],
    collections: [
      { key: 'docs', enabled: true, basePath: '/docs', label: 'docs' },
      { key: 'writing', kind: 'writing', enabled: true, basePath: '/writing', label: 'writing' },
      { key: 'pages', kind: 'page', enabled: true, label: 'pages' },
    ],
    entries: [
      {
        collection: 'docs',
        filePath: 'getting-started.md',
        content: `---
title: Getting started
description: A starter docs page you can replace.
order: 1
---

This page lives in the docs collection.

Use docs for stable instructions: setup steps, API notes, configuration, troubleshooting, and anything people should be able to find later.

Edit this file at \`docs/src/content/docs/getting-started.md\`, then run \`docsmint dev\` to preview changes.
`,
      },
      {
        collection: 'writing',
        filePath: 'hello.md',
        content: `---
title: Hello
description: A starter writing post you can replace.
date: 2026-01-01
author: You
---

This page lives in the writing collection.

Use writing for dated context: release notes, project updates, design notes, essays, and announcements.

Docs explain how the project works. Writing explains what changed and why.
`,
      },
    ],
  },
  custom: {
    key: 'custom',
    description: 'Minimal markdown docs and writing with a custom collection.',
    writingDescription: 'Notes, updates, and longer writing.',
    nav: [
      { label: 'docs', href: '/docs' },
      { label: 'writing', href: '/writing' },
      { label: 'playbooks', href: '/playbooks' },
    ],
    collections: [
      { key: 'docs', enabled: true, basePath: '/docs', label: 'docs' },
      { key: 'writing', kind: 'writing', enabled: true, basePath: '/writing', label: 'writing' },
      { key: 'playbooks', kind: 'content', enabled: true, basePath: '/playbooks', label: 'playbooks' },
      { key: 'pages', kind: 'page', enabled: true, label: 'pages' },
    ],
    entries: [
      {
        collection: 'docs',
        filePath: 'getting-started.md',
        content: `---
title: Getting started
description: A starter docs page you can replace.
order: 1
---

Use docs for stable instructions.

This custom starter also includes a \`playbooks\` collection. Check \`docs/src/content/playbooks/on-call.md\` for the custom collection example.
`,
      },
      {
        collection: 'writing',
        filePath: 'hello.md',
        content: `---
title: Hello
description: A starter writing post you can replace.
date: 2026-01-01
author: You
---

Use writing for dated context: release notes, project updates, design notes, essays, and announcements.
`,
      },
      {
        collection: 'playbooks',
        filePath: 'on-call.md',
        content: `---
title: On-call playbook
description: A custom content collection example.
order: 1
---

This page lives in a custom \`playbooks\` collection.

The collection is configured in \`docs/docsmint.config.ts\`:

\`\`\`ts
collections: {
  playbooks: {
    enabled: true,
    kind: 'content',
    basePath: '/playbooks',
    label: 'playbooks',
  },
}
\`\`\`

Use custom collections when docs and writing are not enough for the shape of your site.
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
