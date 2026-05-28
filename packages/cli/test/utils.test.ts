import test from 'node:test'
import assert from 'node:assert/strict'
import os from 'node:os'
import path from 'node:path'
import fs from 'node:fs/promises'

import { publicationSurfaceKeys } from '@tidypress/config'
import { scaffoldDocs } from '../src/application/scaffolding/scaffold-docs.js'
import { isCapabilityEnabled, withDefaults } from '@tidypress/config'

import { createContentSnapshot } from '../src/application/content/published-content.js'
import { writeLlmsTxt } from '../src/application/content/llms-txt.js'
import { copyDistToDestination, resolveDeployTarget } from '../src/application/deployment/deploy-target.js'
import { getBuildDir } from '../src/infrastructure/engine/build-session.js'

test('getBuildDir resolves build/ under publish root', () => {
  const docsDir = '/tmp/project/site'
  assert.equal(getBuildDir(docsDir), '/tmp/project/site/build')
})

test('scaffoldDocs creates docs and writing content structure', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tidypress-scaffold-'))
  const docsDir = path.join(root, 'site')

  await scaffoldDocs({ docsDir, projectName: 'example-project', starterPreset: 'docs-writing' })

  const config = await fs.readFile(path.join(docsDir, 'tidypress.config.ts'), 'utf8')
  const docsPage = await fs.readFile(
    path.join(docsDir, 'src/content/docs/getting-started.md'),
    'utf8',
  )
  const writingPage = await fs.readFile(
    path.join(docsDir, 'src/content/writing/hello.md'),
    'utf8',
  )

  assert.match(config, /export default \{/)
  assert.match(config, /siteUrl/)
  assert.match(config, /"collections":/)
  assert.match(docsPage, /title: Getting started/)
  assert.match(writingPage, /title: Hello/)
})

test('scaffoldDocs blog preset creates writing only and disables docs', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tidypress-scaffold-blog-'))
  const docsDir = path.join(root, 'site')

  await scaffoldDocs({ docsDir, projectName: 'blog-site', starterPreset: 'blog' })

  const config = await fs.readFile(path.join(docsDir, 'tidypress.config.ts'), 'utf8')
  assert.match(config, /"disable": \[\s*"docs",\s*"pages"\s*\]/)
  assert.match(config, /"pages":\s*\{[^}]*"enabled": false/)
  assert.doesNotMatch(config, /"kind": "projects"/)
  await fs.access(path.join(docsDir, 'src/content/writing/hello.md'))
  await assert.rejects(fs.access(path.join(docsDir, 'src/content/docs/getting-started.md')))
})

test('scaffoldDocs lab preset creates writing and projects', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tidypress-scaffold-lab-'))
  const docsDir = path.join(root, 'site')

  await scaffoldDocs({ docsDir, projectName: 'lab-site', starterPreset: 'lab' })

  const config = await fs.readFile(path.join(docsDir, 'tidypress.config.ts'), 'utf8')
  assert.match(config, /"kind": "projects"/)
  assert.match(config, /"disable": \[\s*"docs",\s*"pages"\s*\]/)
  await fs.access(path.join(docsDir, 'src/content/projects/sample-project.md'))
})

test('scaffoldDocs body-of-work preset seeds works, reference, and process', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tidypress-scaffold-body-'))
  const docsDir = path.join(root, 'site')

  await scaffoldDocs({ docsDir, projectName: 'work-site', starterPreset: 'body-of-work' })

  const config = await fs.readFile(path.join(docsDir, 'tidypress.config.ts'), 'utf8')
  for (const key of publicationSurfaceKeys) {
    assert.match(config, new RegExp(`"${key}"`))
  }
  await fs.access(path.join(docsDir, 'src/content/works/sample-work.md'))
  await fs.access(path.join(docsDir, 'src/content/reference/cli.md'))
  await fs.access(path.join(docsDir, 'src/content/process/0001-sample-decision.md'))
  await fs.access(path.join(docsDir, 'src/content/pages/about.md'))
  assert.match(config, /"layout": "card"/)
  assert.match(config, /"disable": \[\s*"docs"\s*\]/)
  assert.match(config, /"label": "works"/)
  assert.match(config, /"label": "reference"/)
  const navBlock = config.match(/"nav":\s*(\[[\s\S]*?\]),/)?.[1] ?? ''
  assert.doesNotMatch(navBlock, /"href": "\/reference"/)
  assert.match(config, /Set siteUrl in tidypress\.config\.ts/)
  assert.match(config, /"href": "\/reference"/)
  assert.match(config, /"href": "\/process"/)
  await assert.rejects(fs.access(path.join(docsDir, 'src/content/docs/getting-started.md')))
})

test('scaffoldDocs body-of-work-docs preset enables docs collection', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tidypress-scaffold-body-docs-'))
  const docsDir = path.join(root, 'site')

  await scaffoldDocs({ docsDir, projectName: 'work-site', starterPreset: 'body-of-work-docs' })

  const config = await fs.readFile(path.join(docsDir, 'tidypress.config.ts'), 'utf8')
  assert.match(config, /"docs":\s*\{[^}]*"enabled": true/)
  assert.match(config, /"href": "\/docs"/)
  await fs.access(path.join(docsDir, 'src/content/docs/getting-started.md'))
})

test('scaffoldDocs init siteUrl is written when provided', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tidypress-scaffold-siteurl-'))
  const docsDir = path.join(root, 'site')

  await scaffoldDocs({
    docsDir,
    projectName: 'my-site',
    starterPreset: 'lab',
    siteUrl: 'https://publish.example',
  })

  const config = await fs.readFile(path.join(docsDir, 'tidypress.config.ts'), 'utf8')
  assert.match(config, /"siteUrl": "https:\/\/publish\.example"/)
  assert.doesNotMatch(config, /Set siteUrl in tidypress/)
})

test('scaffoldDocs custom preset creates a custom content collection example', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tidypress-scaffold-custom-'))
  const docsDir = path.join(root, 'site')

  await scaffoldDocs({ docsDir, projectName: 'example-project', starterPreset: 'custom' })

  const config = await fs.readFile(path.join(docsDir, 'tidypress.config.ts'), 'utf8')
  const playbook = await fs.readFile(path.join(docsDir, 'src/content/playbooks/on-call.md'), 'utf8')

  assert.match(config, /playbooks/)
  assert.match(config, /"kind": "content"/)
  assert.match(playbook, /title: On-call playbook/)
})

test('scaffoldDocs rejects unknown starter presets', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tidypress-scaffold-preset-'))
  const docsDir = path.join(root, 'site')

  await assert.rejects(async () => {
    await scaffoldDocs({ docsDir, projectName: 'example-project', starterPreset: 'unknown' })
  }, /Unknown starter preset/)
})

test('createContentSnapshot returns docs, writing, and pages collection entries', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tidypress-context-'))
  const docsDir = path.join(root, 'site')
  await fs.mkdir(path.join(docsDir, 'src/content/docs'), { recursive: true })
  await fs.mkdir(path.join(docsDir, 'src/content/writing'), { recursive: true })
  await fs.mkdir(path.join(docsDir, 'src/content/pages'), { recursive: true })

  await fs.writeFile(
    path.join(docsDir, 'src/content/docs/getting-started.md'),
    `---
title: Getting started
description: Intro page
---

Welcome to docs.
`,
    'utf8',
  )
  await fs.writeFile(
    path.join(docsDir, 'src/content/writing/hello.md'),
    `---
title: Hello
description: Intro writing
---

Hello world writing.
`,
    'utf8',
  )
  await fs.writeFile(
    path.join(docsDir, 'src/content/pages/about.md'),
    `---
title: About
description: About page
---

About custom page content.
`,
    'utf8',
  )

  const snapshot = await createContentSnapshot(docsDir)
  assert.equal(snapshot.length, 3)
  assert.deepEqual(
    snapshot.map(item => item.collection).sort(),
    ['docs', 'pages', 'writing'],
  )
})

test('llmsTxt capability defaults on and can be disabled in config', () => {
  const enabled = withDefaults({ name: 'site' })
  assert.equal(isCapabilityEnabled(enabled, 'llmsTxt'), true)

  const disabled = withDefaults({
    name: 'site',
    capabilities: { disable: ['llmsTxt'] },
  })
  assert.equal(isCapabilityEnabled(disabled, 'llmsTxt'), false)
})

test('writeLlmsTxt writes grouped public links', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tidypress-llms-'))
  const docsDir = path.join(root, 'site')
  await fs.mkdir(path.join(docsDir, 'src/content/writing'), { recursive: true })
  await fs.writeFile(
    path.join(docsDir, 'src/content/writing/hello.md'),
    `---
title: Hello
description: First post
date: 2026-05-01
---

Body.
`,
    'utf8',
  )

  const outputPath = path.join(root, 'build', 'llms.txt')
  await writeLlmsTxt({
    docsDir,
    outputPath,
    config: {
      name: 'Demo',
      description: 'A demo site.',
      siteUrl: 'https://publish.example',
      collections: {
        writing: { enabled: true, kind: 'writing', basePath: '/writing', label: 'writing' },
      },
    },
  })

  const text = await fs.readFile(outputPath, 'utf8')
  assert.match(text, /^# Demo/m)
  assert.match(text, /> A demo site\./)
  assert.match(text, /### \[Hello\]\(https:\/\/publish\.example\/writing\/hello\)/)
  assert.match(text, /First post/)
  assert.match(text, /^Body\.$/m)
})

test('writeLlmsTxt uses relative links when siteUrl is placeholder', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tidypress-llms-placeholder-'))
  const docsDir = path.join(root, 'site')
  await fs.mkdir(path.join(docsDir, 'src/content/writing'), { recursive: true })
  await fs.writeFile(
    path.join(docsDir, 'src/content/writing/hello.md'),
    `---
title: Hello
date: 2026-05-01
---
`,
    'utf8',
  )

  const outputPath = path.join(root, 'build', 'llms.txt')
  await writeLlmsTxt({
    docsDir,
    outputPath,
    config: {
      name: 'Demo',
      siteUrl: 'https://example.com',
      collections: {
        writing: { enabled: true, kind: 'writing', basePath: '/writing', label: 'writing' },
      },
    },
  })

  const text = await fs.readFile(outputPath, 'utf8')
  assert.doesNotMatch(text, /https:\/\/example\.com/)
  assert.match(text, /### \[Hello\]\(\/writing\/hello\)/)
})

test('createContentSnapshot excludes draft entries (published: false)', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tidypress-context-drafts-'))
  const docsDir = path.join(root, 'site')
  await fs.mkdir(path.join(docsDir, 'src/content/docs'), { recursive: true })

  await fs.writeFile(
    path.join(docsDir, 'src/content/docs/public.md'),
    `---
title: Public doc
---
Visible content.
`,
    'utf8',
  )
  await fs.writeFile(
    path.join(docsDir, 'src/content/docs/draft.md'),
    `---
title: Draft doc
published: false
---
Hidden content.
`,
    'utf8',
  )

  const snapshot = await createContentSnapshot(docsDir)
  assert.equal(snapshot.length, 1)
  assert.equal(snapshot[0].title, 'Public doc')
})

test('createContentSnapshot excludes entries scheduled in the future', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tidypress-context-scheduled-'))
  const docsDir = path.join(root, 'site')
  await fs.mkdir(path.join(docsDir, 'src/content/docs'), { recursive: true })

  await fs.writeFile(
    path.join(docsDir, 'src/content/docs/live.md'),
    `---
title: Live doc
scheduled: 2024-01-01T00:00:00Z
---
Visible now.
`,
    'utf8',
  )
  await fs.writeFile(
    path.join(docsDir, 'src/content/docs/future.md'),
    `---
title: Future doc
scheduled: 2099-01-01T00:00:00Z
---
Not visible yet.
`,
    'utf8',
  )

  const snapshot = await createContentSnapshot(docsDir)
  assert.equal(snapshot.length, 1)
  assert.equal(snapshot[0].title, 'Live doc')
})

test('createContentSnapshot honors configured collection registry', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tidypress-context-collections-'))
  const docsDir = path.join(root, 'site')
  await fs.mkdir(path.join(docsDir, 'src/content/playbooks'), { recursive: true })
  await fs.writeFile(
    path.join(docsDir, 'src/content/playbooks/oncall.md'),
    `---
title: On-call guide
---
Guide content.
`,
    'utf8',
  )

  const snapshot = await createContentSnapshot(docsDir, {
    collections: {
      docs: { enabled: false },
      writing: { enabled: false, kind: 'writing' },
      playbooks: { enabled: true, kind: 'content' },
    },
  })

  assert.equal(snapshot.length, 1)
  assert.equal(snapshot[0].collection, 'playbooks')
})

test('createContentSnapshot honors capabilities enable/disable for starter collections', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tidypress-context-capabilities-'))
  const docsDir = path.join(root, 'site')
  await fs.mkdir(path.join(docsDir, 'src/content/docs'), { recursive: true })
  await fs.mkdir(path.join(docsDir, 'src/content/writing'), { recursive: true })

  await fs.writeFile(
    path.join(docsDir, 'src/content/docs/getting-started.md'),
    `---
title: Docs
---
docs content
`,
    'utf8',
  )
  await fs.writeFile(
    path.join(docsDir, 'src/content/writing/hello.md'),
    `---
title: Writing
---
writing content
`,
    'utf8',
  )

  const snapshot = await createContentSnapshot(docsDir, {
    collections: {
      docs: { enabled: true },
      writing: { enabled: true, kind: 'writing' },
    },
    capabilities: {
      disable: ['docs'],
      enable: ['writing'],
    },
  })

  assert.equal(snapshot.length, 1)
  assert.equal(snapshot[0].collection, 'writing')
})

test('resolveDeployTarget supports artifact-only mode', () => {
  const plan = resolveDeployTarget({ projectRoot: '/tmp/project', target: undefined })
  assert.equal(plan.kind, 'artifact-only')
})

test('resolveDeployTarget resolves local path targets', () => {
  const plan = resolveDeployTarget({ projectRoot: '/tmp/project', target: './publish' })
  assert.equal(plan.kind, 'local-copy')
  if (plan.kind === 'local-copy') {
    assert.equal(plan.destinationPath, '/tmp/project/publish')
  }
})

test('resolveDeployTarget maps s3 URI targets to provider strategy', () => {
  const plan = resolveDeployTarget({
    projectRoot: '/tmp/project',
    target: 's3://my-bucket/docs',
  })
  assert.equal(plan.kind, 'provider')
  if (plan.kind === 'provider') {
    assert.equal(plan.provider, 's3')
    assert.equal(plan.extra, 's3://my-bucket/docs')
  }
})

test('resolveDeployTarget maps ssh URI targets to provider strategy', () => {
  const plan = resolveDeployTarget({
    projectRoot: '/tmp/project',
    target: 'ssh://deploy@example.com/var/www/site',
  })
  assert.equal(plan.kind, 'provider')
  if (plan.kind === 'provider') {
    assert.equal(plan.provider, 'ssh')
    assert.equal(plan.extra, 'ssh://deploy@example.com/var/www/site')
  }
})

test('resolveDeployTarget maps ssh scp targets to provider strategy', () => {
  const plan = resolveDeployTarget({
    projectRoot: '/tmp/project',
    target: 'deploy@example.com:/var/www/site',
  })
  assert.equal(plan.kind, 'provider')
  if (plan.kind === 'provider') {
    assert.equal(plan.provider, 'ssh')
    assert.equal(plan.extra, 'deploy@example.com:/var/www/site')
  }
})

test('resolveDeployTarget maps named docker and static targets to provider strategy', () => {
  const dockerPlan = resolveDeployTarget({
    projectRoot: '/tmp/project',
    target: 'docker',
  })
  const staticPlan = resolveDeployTarget({
    projectRoot: '/tmp/project',
    target: 'static',
  })

  assert.equal(dockerPlan.kind, 'provider')
  assert.equal(staticPlan.kind, 'provider')
  if (dockerPlan.kind === 'provider') {
    assert.equal(dockerPlan.provider, 'docker')
    assert.equal(dockerPlan.extra, undefined)
  }
  if (staticPlan.kind === 'provider') {
    assert.equal(staticPlan.provider, 'static')
    assert.equal(staticPlan.extra, undefined)
  }
})

test('resolveDeployTarget keeps generic external URI targets', () => {
  const plan = resolveDeployTarget({
    projectRoot: '/tmp/project',
    target: 'https://cdn.example.com/docs',
  })
  assert.equal(plan.kind, 'external-target')
  if (plan.kind === 'external-target') {
    assert.equal(plan.target, 'https://cdn.example.com/docs')
  }
})

test('copyDistToDestination copies built artifact to destination path', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tidypress-deploy-'))
  const distDir = path.join(root, 'dist')
  const destinationDir = path.join(root, 'output')

  await fs.mkdir(distDir, { recursive: true })
  await fs.writeFile(path.join(distDir, 'index.html'), '<html>ok</html>', 'utf8')
  await copyDistToDestination({ distDir, destinationDir })

  const copied = await fs.readFile(path.join(destinationDir, 'index.html'), 'utf8')
  assert.equal(copied, '<html>ok</html>')
})
