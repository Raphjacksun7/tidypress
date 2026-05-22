import test from 'node:test'
import assert from 'node:assert/strict'
import os from 'node:os'
import path from 'node:path'
import fs from 'node:fs/promises'

import { scaffoldDocs } from '../src/application/scaffolding/scaffold-docs.js'
import { createContentSnapshot, writeContentSnapshot } from '../src/application/content/context-snapshot.js'
import { copyDistToDestination, resolveDeployTarget } from '../src/application/deployment/deploy-target.js'
import { getWorkdir } from '../src/infrastructure/engine/workdir.js'

test('getWorkdir resolves .docsmint under docs directory', () => {
  const docsDir = '/tmp/project/docs'
  assert.equal(getWorkdir(docsDir), '/tmp/project/docs/.docsmint')
})

test('scaffoldDocs creates docs and writing content structure', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'docsmint-scaffold-'))
  const docsDir = path.join(root, 'docs')

  await scaffoldDocs({ docsDir, projectName: 'example-project' })

  const config = await fs.readFile(path.join(docsDir, 'docsmint.config.ts'), 'utf8')
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
  assert.match(config, /collections:/)
  assert.match(docsPage, /title: Getting started/)
  assert.match(writingPage, /title: Hello/)
})

test('scaffoldDocs rejects unknown starter presets', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'docsmint-scaffold-preset-'))
  const docsDir = path.join(root, 'docs')

  await assert.rejects(async () => {
    await scaffoldDocs({ docsDir, projectName: 'example-project', starterPreset: 'unknown' })
  }, /Unknown starter preset/)
})

test('createContentSnapshot returns docs, writing, and pages collection entries', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'docsmint-context-'))
  const docsDir = path.join(root, 'docs')
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

test('createContentSnapshot excludes draft entries (published: false)', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'docsmint-context-drafts-'))
  const docsDir = path.join(root, 'docs')
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
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'docsmint-context-scheduled-'))
  const docsDir = path.join(root, 'docs')
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
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'docsmint-context-collections-'))
  const docsDir = path.join(root, 'docs')
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
      docs: { enabled: false, kind: 'docs' },
      writing: { enabled: false, kind: 'writing' },
      playbooks: { enabled: true, kind: 'docs' },
    },
  })

  assert.equal(snapshot.length, 1)
  assert.equal(snapshot[0].collection, 'playbooks')
})

test('createContentSnapshot honors capabilities enable/disable for starter collections', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'docsmint-context-capabilities-'))
  const docsDir = path.join(root, 'docs')
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
      docs: { enabled: true, kind: 'docs' },
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

test('writeContentSnapshot matches golden output', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'docsmint-context-golden-'))
  const docsDir = path.join(root, 'docs')
  const outputPath = path.join(root, 'docsmint-context.md')

  await fs.mkdir(path.join(docsDir, 'src/content/docs'), { recursive: true })
  await fs.mkdir(path.join(docsDir, 'src/content/writing'), { recursive: true })
  await fs.mkdir(path.join(docsDir, 'src/content/pages'), { recursive: true })

  await fs.writeFile(
    path.join(docsDir, 'src/content/docs/getting-started.md'),
    `---
title: Getting started
description: Docs intro
---

Welcome to docs fixture.
`,
    'utf8',
  )
  await fs.writeFile(
    path.join(docsDir, 'src/content/writing/hello.md'),
    `---
title: Hello writing
description: Writing intro
date: 2026-01-01
---

Hello from writing fixture.
`,
    'utf8',
  )
  await fs.writeFile(
    path.join(docsDir, 'src/content/pages/about.md'),
    `---
title: About
---

About fixture page.
`,
    'utf8',
  )

  await writeContentSnapshot({ docsDir, outputPath })
  const actual = await fs.readFile(outputPath, 'utf8')
  const expected = await fs.readFile(new URL('./fixtures/context-snapshot.golden.md', import.meta.url), 'utf8')
  assert.equal(actual, expected)
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
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'docsmint-deploy-'))
  const distDir = path.join(root, 'dist')
  const destinationDir = path.join(root, 'output')

  await fs.mkdir(distDir, { recursive: true })
  await fs.writeFile(path.join(distDir, 'index.html'), '<html>ok</html>', 'utf8')
  await copyDistToDestination({ distDir, destinationDir })

  const copied = await fs.readFile(path.join(destinationDir, 'index.html'), 'utf8')
  assert.equal(copied, '<html>ok</html>')
})
