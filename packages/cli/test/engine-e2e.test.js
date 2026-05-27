import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { scaffoldDocs } from '../src/application/scaffolding/scaffold-docs.js'
import { BuildService } from '../src/services/BuildService.js'
import { ConfigLoader } from '../src/services/ConfigLoader.js'
import { EngineManager } from '../src/services/EngineManager.js'

async function createEngineFixtureProject() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tidypress-engine-e2e-'))
  const docsDir = path.join(root, 'docs')
  await fs.mkdir(path.join(docsDir, 'src/content/docs'), { recursive: true })
  await fs.mkdir(path.join(docsDir, 'src/content/docs/fr'), { recursive: true })
  await fs.mkdir(path.join(docsDir, 'src/content/docs/v1.0'), { recursive: true })
  await fs.mkdir(path.join(docsDir, 'src/content/docs/v2.0'), { recursive: true })
  await fs.mkdir(path.join(docsDir, 'src/content/writing'), { recursive: true })
  await fs.mkdir(path.join(docsDir, 'src/content/writing/fr'), { recursive: true })
  await fs.mkdir(path.join(docsDir, 'src/content/playbooks'), { recursive: true })
  await fs.mkdir(path.join(docsDir, 'src/content/pages'), { recursive: true })

  await fs.writeFile(
    path.join(docsDir, 'tidypress.config.ts'),
    `export default {
  name: 'Engine e2e fixture',
  description: 'Integration fixture for build coverage.',
  siteUrl: 'https://example.com',
  nav: [
    { label: 'docs', href: '/docs' },
    { label: 'writing', href: '/writing' },
    { label: 'playbooks', href: '/playbooks' },
  ],
  collections: {
    playbooks: {
      enabled: true,
      basePath: '/playbooks',
      kind: 'content',
      label: 'playbooks',
    },
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr'],
    strings: {
      fr: {
        writingTitle: 'Ecriture',
        docsTitle: 'Documentation',
        languageLabel: 'langue',
        searchPlaceholder: 'Rechercher docs...',
      },
    },
  },
  versions: [
    { label: 'v2.0', path: '/docs/v2.0' },
    { label: 'v1.0', path: '/docs/v1.0' },
  ],
  footer: [],
}
`,
    'utf8',
  )

  await fs.writeFile(
    path.join(docsDir, 'src/content/docs/getting-started.mdx'),
    `---
title: Getting started
description: MDX fixture doc
order: 1
---

# MDX fixture heading

<Callout type="tip">
MDX callout renders in production build.
</Callout>
`,
    'utf8',
  )

  await fs.writeFile(
    path.join(docsDir, 'src/content/docs/private.md'),
    `---
title: Private page
description: Search-hidden doc
search: false
---

This page should be excluded from pagefind indexing.
`,
    'utf8',
  )

  await fs.writeFile(
    path.join(docsDir, 'src/content/docs/fr/getting-started.mdx'),
    `---
title: Demarrage
description: Version francaise
order: 1
---

# Guide francais

Version francaise.
`,
    'utf8',
  )

  await fs.writeFile(
    path.join(docsDir, 'src/content/docs/v1.0/getting-started.md'),
    `---
title: Getting started v1
description: Legacy version doc
order: 1
---

# Legacy guide

Version 1 doc body.
`,
    'utf8',
  )

  await fs.writeFile(
    path.join(docsDir, 'src/content/docs/v2.0/getting-started.md'),
    `---
title: Getting started v2
description: Current version doc
order: 1
---

# Current guide

Version 2 doc body.
`,
    'utf8',
  )

  await fs.writeFile(
    path.join(docsDir, 'src/content/writing/hello.md'),
    `---
title: Hello writing
description: Writing fixture
date: 2026-01-01
---

Hello writing fixture.
`,
    'utf8',
  )

  await fs.writeFile(
    path.join(docsDir, 'src/content/writing/fr/bonjour.md'),
    `---
title: Bonjour ecriture
description: Ecriture francaise
date: 2026-01-02
---

Bonjour ecriture.
`,
    'utf8',
  )

  await fs.writeFile(
    path.join(docsDir, 'src/content/playbooks/incident-response.mdx'),
    `---
title: Incident response
description: Custom docs collection fixture
order: 1
---

# Playbook entry

Custom collection content renders with docs layout.
`,
    'utf8',
  )

  return { root, docsDir }
}

async function readFirstExisting(baseDir, candidates) {
  for (const candidate of candidates) {
    const fullPath = path.join(baseDir, candidate)
    try {
      return await fs.readFile(fullPath, 'utf8')
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
        continue
      }
      throw error
    }
  }
  throw new Error(`None of the expected files exist: ${candidates.join(', ')}`)
}

test('BuildService renders MDX and emits pagefind artifacts', { timeout: 900_000 }, async () => {
  const { root, docsDir } = await createEngineFixtureProject()
  const service = new BuildService({
    configLoader: new ConfigLoader(),
    engineManager: new EngineManager(),
  })

  const { buildDir, cacheDir } = await service.build({ projectRoot: root })
  const distDir = buildDir
  await assert.rejects(async () => {
    await fs.access(path.join(docsDir, '.tidypress'))
  })

  const docsHtml = await fs.readFile(path.join(distDir, 'fr/docs/getting-started/index.html'), 'utf8')
  assert.match(docsHtml, /Guide francais/)
  assert.match(docsHtml, /Version francaise\./)
  // Locale switching UI now renders as nav links; assert rendered locale directly.
  assert.match(docsHtml, /<html lang="fr"/)
  assert.match(docsHtml, /href="\/fr\/docs"/)
  assert.match(docsHtml, /href="\/fr\/writing"/)
  assert.match(docsHtml, /href="\/playbooks"/)
  assert.doesNotMatch(docsHtml, /href="\/fr\/playbooks"/)
  assert.match(docsHtml, /value="\/fr\/docs\/v1\.0\/getting-started"/)
  assert.match(docsHtml, /value="\/fr\/docs\/v2\.0\/getting-started"/)
  assert.doesNotMatch(docsHtml, /value="\/docs\/v1\.0\/getting-started"/)
  assert.doesNotMatch(docsHtml, /value="\/docs\/v2\.0\/getting-started"/)
  assert.match(docsHtml, /Rechercher docs\.\.\./)
  assert.doesNotMatch(docsHtml, /Search this version\.\.\./)
  assert.doesNotMatch(docsHtml, /data-pagefind-ignore="true"/)
  assert.match(docsHtml, /<meta name="viewport" content="width=device-width, initial-scale=1"/)
  assert.match(docsHtml, /role="dialog" aria-modal="true"/)
  assert.match(docsHtml, /aria-label="(language|langue)"/)
  assert.ok(Buffer.byteLength(docsHtml, 'utf8') < 220_000, 'docs page should stay under lightweight HTML budget')
  assert.match(docsHtml, /<meta property="og:image" content="https:\/\/example\.com\/og\.svg">/)
  assert.match(docsHtml, /<meta name="twitter:image" content="https:\/\/example\.com\/og\.svg">/)

  const privateHtml = await readFirstExisting(distDir, [
    'docs/private/index.html',
    'fr/docs/private/index.html',
    'en/docs/private/index.html',
    'docs/fr/private/index.html',
    'docs/en/private/index.html',
  ])
  assert.match(privateHtml, /data-pagefind-ignore="true"/)

  const enDocsHtml = await fs.readFile(path.join(distDir, 'docs/getting-started/index.html'), 'utf8')
  assert.match(enDocsHtml, /MDX fixture heading/)
  assert.match(enDocsHtml, /MDX callout renders in production build\./)
  await assert.rejects(
    () => fs.readFile(path.join(distDir, 'en/docs/getting-started/index.html'), 'utf8'),
    /ENOENT/,
  )

  const localizedWritingHtml = await fs.readFile(path.join(distDir, 'fr/writing/index.html'), 'utf8')
  assert.match(localizedWritingHtml, /Ecriture/)
  const rootWritingHtml = await fs.readFile(path.join(distDir, 'writing/index.html'), 'utf8')
  assert.doesNotMatch(rootWritingHtml, /aria-label="Select version"/)

  const rootHomeHtml = await fs.readFile(path.join(distDir, 'index.html'), 'utf8')
  assert.doesNotMatch(rootHomeHtml, /aria-label="Select version"/)

  const customCollectionHtml = await fs.readFile(path.join(distDir, 'playbooks/incident-response/index.html'), 'utf8')
  assert.match(customCollectionHtml, /Playbook entry/)
  assert.match(customCollectionHtml, /href="\/playbooks"/)
  assert.match(customCollectionHtml, /href="\/playbooks\/incident-response"/)
  assert.match(customCollectionHtml, /data-sidebar-link/)

  const docsRoot = await fs.readFile(path.join(distDir, 'docs/index.html'), 'utf8')
  assert.match(docsRoot, /\/docs\/v2\.0\/getting-started/)

  const versionRoot = await readFirstExisting(distDir, [
    'docs/v1.0/index.html',
    'docs/v1.0/getting-started/index.html',
  ])
  assert.match(versionRoot, /Legacy guide/)

  const versionedDoc = await readFirstExisting(distDir, [
    'docs/v2.0/getting-started/index.html',
    'docs/v2.0/index.html',
  ])
  assert.match(versionedDoc, /\/docs\/v1\.0\/getting-started/)
  assert.match(versionedDoc, /\/docs\/v2\.0\/getting-started/)

  const localizedVersionFallback = await fs.readFile(path.join(distDir, 'fr/docs/v2.0/getting-started/index.html'), 'utf8')
  assert.match(localizedVersionFallback, /Current guide/)
  assert.match(localizedVersionFallback, /<html lang="fr"/)

  await fs.access(path.join(distDir, 'pagefind/pagefind.js'))
  await fs.access(path.join(distDir, 'pagefind/pagefind-entry.json'))
  await fs.access(path.join(distDir, 'og.svg'))

  const configSidecar = await fs.readFile(path.join(cacheDir, 'config.json'), 'utf8')
  assert.match(configSidecar, /"name": "Engine e2e fixture"/)
})

test('blog preset build produces writing-only routes and homepage', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tidypress-engine-blog-'))
  const docsDir = path.join(root, 'docs')

  await scaffoldDocs({ docsDir, projectName: 'blog-e2e', starterPreset: 'blog' })

  const service = new BuildService({
    configLoader: new ConfigLoader(),
    engineManager: new EngineManager(),
  })
  const { buildDir } = await service.build({ projectRoot: root })

  const homeHtml = await fs.readFile(path.join(buildDir, 'index.html'), 'utf8')
  assert.match(homeHtml, /dm-home-section-title">writing/)
  assert.match(homeHtml, /href="\/writing\/hello"/)
  assert.match(homeHtml, /placeholder="Search writing\.\.\."/)
  assert.match(homeHtml, /href="\/writing\/rss\.xml"/)
  assert.doesNotMatch(homeHtml, /href="\/docs/)
  assert.doesNotMatch(homeHtml, /href="\/projects/)
  assert.doesNotMatch(homeHtml, /dm-hero/)

  await fs.access(path.join(buildDir, 'writing/hello/index.html'))
  await fs.access(path.join(buildDir, 'writing/index.html'))
  await fs.access(path.join(buildDir, 'writing/rss.xml'))
  await assert.rejects(() => fs.access(path.join(buildDir, 'docs/index.html')))
  await assert.rejects(() => fs.access(path.join(buildDir, 'projects/index.html')))
  await assert.rejects(() => fs.access(path.join(buildDir, 'pages/index.html')))
})

test('lab preset build produces writing, projects, and collection search filters', { timeout: 900_000 }, async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tidypress-engine-lab-'))
  const docsDir = path.join(root, 'docs')

  await scaffoldDocs({ docsDir, projectName: 'lab-e2e', starterPreset: 'lab' })

  await fs.writeFile(
    path.join(docsDir, 'src/content/projects/sample-project.md'),
    `---
title: Tagged project
description: Project with a tag index route.
status: active
featured: true
tags: [oss]
---

On-site project page.
`,
    'utf8',
  )

  const service = new BuildService({
    configLoader: new ConfigLoader(),
    engineManager: new EngineManager(),
  })
  const { buildDir } = await service.build({ projectRoot: root })

  const homeHtml = await fs.readFile(path.join(buildDir, 'index.html'), 'utf8')
  assert.match(homeHtml, /dm-home-section-title">writing/)
  assert.match(homeHtml, /dm-home-section-title">projects/)
  assert.match(homeHtml, /search-filters/)
  assert.match(homeHtml, /data-search-filter="writing"/)
  assert.match(homeHtml, /data-search-filter="projects"/)
  assert.doesNotMatch(homeHtml, /dm-hero/)
  assert.doesNotMatch(homeHtml, /href="\/docs\//)

  const writingHtml = await fs.readFile(path.join(buildDir, 'writing/hello/index.html'), 'utf8')
  assert.match(writingHtml, /data-pagefind-filter="collection:writing"/)

  await fs.access(path.join(buildDir, 'projects/tags/oss/index.html'))
  await fs.access(path.join(buildDir, 'writing/rss.xml'))
  await assert.rejects(() => fs.access(path.join(buildDir, 'docs/index.html')))
})

test('persona preset build renders hero and about page', { timeout: 900_000 }, async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tidypress-engine-persona-'))
  const docsDir = path.join(root, 'docs')

  await scaffoldDocs({ docsDir, projectName: 'persona-e2e', starterPreset: 'persona' })

  const service = new BuildService({
    configLoader: new ConfigLoader(),
    engineManager: new EngineManager(),
  })
  const { buildDir } = await service.build({ projectRoot: root })

  const homeHtml = await fs.readFile(path.join(buildDir, 'index.html'), 'utf8')
  assert.match(homeHtml, /dm-hero/)
  assert.match(homeHtml, /dm-hero__role/)
  assert.match(homeHtml, /dm-home-section-title">projects/)

  await fs.access(path.join(buildDir, 'about/index.html'))
  await fs.access(path.join(buildDir, 'projects/highlight/index.html'))
})
