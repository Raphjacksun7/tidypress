/**
 * @typedef {{ key: string, kind?: 'content' | 'writing' | 'page' | 'projects', enabled: boolean, basePath?: string, label?: string }} StarterCollection
 * @typedef {{ collection: string, filePath: string, content: string }} StarterSeedEntry
 * @typedef {{
 *   key: string
 *   description: string
 *   writingDescription: string
 *   nav: Array<{ label: string, href: string }>
 *   collections: StarterCollection[]
 *   entries: StarterSeedEntry[]
 *   homeOrder?: string[]
 *   capabilitiesDisable?: string[]
 *   pages?: Array<{ slug: string, navLabel?: string }>
 *   hero?: { enabled?: boolean, role?: string, pronunciation?: string, lead?: string, image?: string, links?: Array<{ label: string, href: string, external?: boolean }> }
 * }} StarterPreset
 */

const SITE_DESCRIPTION = 'A publishing framework for Git-native authorship.'

/** @type {Record<string, StarterPreset>} */
export const STARTER_PRESETS = {
  lab: {
    key: 'lab',
    description: SITE_DESCRIPTION,
    writingDescription: 'Notes, updates, and longer-form writing.',
    nav: [
      { label: 'writing', href: '/writing' },
      { label: 'projects', href: '/projects' },
    ],
    homeOrder: ['writing', 'projects'],
    capabilitiesDisable: ['docs', 'pages'],
    collections: [
      { key: 'docs', enabled: false, basePath: '/docs', label: 'docs' },
      { key: 'writing', kind: 'writing', enabled: true, basePath: '/writing', label: 'writing' },
      { key: 'projects', kind: 'projects', enabled: true, basePath: '/projects', label: 'projects' },
      { key: 'pages', kind: 'page', enabled: false, label: 'pages' },
    ],
    entries: [
      {
        collection: 'writing',
        filePath: 'hello.md',
        content: `---
title: Hello
description: A starter writing post you can replace.
date: 2026-05-01
featured: true
---

Use the writing collection for dated posts: release notes, essays, and lab updates.
`,
      },
      {
        collection: 'projects',
        filePath: 'sample-project.md',
        content: `---
title: Sample project
description: Replace with a project you ship or maintain.
status: active
featured: true
---

Optional body copy when the project has an on-site page. Set \`url\` to link out instead.
`,
      },
      {
        collection: 'projects',
        filePath: 'external-tool.md',
        content: `---
title: External tool
description: Card links out without a full page.
url: https://example.com
linkOnly: true
featured: true
---
`,
      },
    ],
  },
  blog: {
    key: 'blog',
    description: SITE_DESCRIPTION,
    writingDescription: 'Writing.',
    nav: [{ label: 'writing', href: '/writing' }],
    homeOrder: ['writing'],
    capabilitiesDisable: ['docs', 'pages'],
    collections: [
      { key: 'docs', enabled: false, basePath: '/docs', label: 'docs' },
      { key: 'writing', kind: 'writing', enabled: true, basePath: '/writing', label: 'writing' },
      { key: 'pages', kind: 'page', enabled: false, label: 'pages' },
    ],
    entries: [
      {
        collection: 'writing',
        filePath: 'hello.md',
        content: `---
title: Hello
description: First post.
date: 2026-05-01
---

A writing-only site. Add posts under \`docs/src/content/writing/\`.
`,
      },
    ],
  },
  'docs-writing': {
    key: 'docs-writing',
    description: SITE_DESCRIPTION,
    writingDescription: 'Notes and updates.',
    nav: [
      { label: 'writing', href: '/writing' },
      { label: 'docs', href: '/docs' },
    ],
    homeOrder: ['writing', 'docs'],
    collections: [
      { key: 'docs', enabled: true, basePath: '/docs', label: 'docs' },
      { key: 'writing', kind: 'writing', enabled: true, basePath: '/writing', label: 'writing' },
      { key: 'pages', kind: 'page', enabled: true, label: 'pages' },
    ],
    entries: [
      {
        collection: 'writing',
        filePath: 'hello.md',
        content: `---
title: Hello
description: A starter writing post.
date: 2026-05-01
---
`,
      },
      {
        collection: 'docs',
        filePath: 'getting-started.md',
        content: `---
title: Getting started
description: Starter docs page.
order: 1
---

Reference material lives in the docs collection.
`,
      },
    ],
  },
  persona: {
    key: 'persona',
    description: SITE_DESCRIPTION,
    writingDescription: 'Selected writing.',
    nav: [
      { label: 'projects', href: '/projects' },
      { label: 'writing', href: '/writing' },
      { label: 'about', href: '/about' },
    ],
    homeOrder: ['projects', 'writing'],
    pages: [{ slug: 'about', navLabel: 'about' }],
    hero: {
      enabled: true,
      role: 'Engineer',
      lead: 'Short bio shown on the home page. Edit in tidypress.config.ts.',
      links: [
        { label: 'Email', href: 'mailto:you@example.com' },
        { label: 'GitHub', href: 'https://github.com/example', external: true },
      ],
    },
    collections: [
      { key: 'docs', enabled: false, basePath: '/docs', label: 'docs' },
      { key: 'writing', kind: 'writing', enabled: true, basePath: '/writing', label: 'writing' },
      { key: 'projects', kind: 'projects', enabled: true, basePath: '/projects', label: 'projects' },
      { key: 'pages', kind: 'page', enabled: true, label: 'pages' },
    ],
    entries: [
      {
        collection: 'projects',
        filePath: 'highlight.md',
        content: `---
title: Highlight project
description: One line about the work.
url: https://example.com
featured: true
linkOnly: true
---
`,
      },
      {
        collection: 'writing',
        filePath: 'hello.md',
        content: `---
title: Hello
description: Optional writing sample.
date: 2026-05-01
---
`,
      },
      {
        collection: 'pages',
        filePath: 'about.md',
        content: `---
title: About
description: CV and background.
navLabel: about
---

Long-form background, experience, and skills live here.
`,
      },
    ],
  },
  custom: {
    key: 'custom',
    description: SITE_DESCRIPTION,
    writingDescription: 'Notes, updates, and longer writing.',
    nav: [
      { label: 'writing', href: '/writing' },
      { label: 'docs', href: '/docs' },
      { label: 'playbooks', href: '/playbooks' },
    ],
    homeOrder: ['writing', 'playbooks', 'docs'],
    collections: [
      { key: 'docs', enabled: true, basePath: '/docs', label: 'docs' },
      { key: 'writing', kind: 'writing', enabled: true, basePath: '/writing', label: 'writing' },
      { key: 'playbooks', kind: 'content', enabled: true, basePath: '/playbooks', label: 'playbooks' },
      { key: 'pages', kind: 'page', enabled: true, label: 'pages' },
    ],
    entries: [
      {
        collection: 'writing',
        filePath: 'hello.md',
        content: `---
title: Hello
date: 2026-05-01
---
`,
      },
      {
        collection: 'docs',
        filePath: 'getting-started.md',
        content: `---
title: Getting started
order: 1
---
`,
      },
      {
        collection: 'playbooks',
        filePath: 'on-call.md',
        content: `---
title: On-call playbook
order: 1
---
`,
      },
    ],
  },
}

export const DEFAULT_STARTER_PRESET = 'lab'

/**
 * @param {string | undefined} requestedPreset
 * @returns {StarterPreset}
 */
export function resolveStarterPreset(requestedPreset) {
  const normalized = requestedPreset === 'default' ? 'lab' : (requestedPreset ?? DEFAULT_STARTER_PRESET)
  const match = STARTER_PRESETS[normalized]
  if (!match) {
    const supported = Object.keys(STARTER_PRESETS).join(', ')
    throw new Error(`Unknown starter preset "${requestedPreset}". Supported presets: ${supported}, default (alias for lab).`)
  }
  return match
}
