import test from 'node:test'
import assert from 'node:assert/strict'
import os from 'node:os'
import path from 'node:path'
import fs from 'node:fs/promises'

import { getWorkdir } from '../src/utils/engine.js'
import { scaffoldDocs } from '../src/utils/scaffold.js'
import { createContentSnapshot } from '../src/utils/context.js'
import { copyDistToDestination, resolveDeployTarget } from '../src/utils/deploy.js'

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

  assert.match(config, /defineConfig/)
  assert.match(docsPage, /title: Getting started/)
  assert.match(writingPage, /title: Hello/)
})

test('createContentSnapshot returns docs, writing, and extension entries', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'docsmint-context-'))
  const docsDir = path.join(root, 'docs')
  await fs.mkdir(path.join(docsDir, 'src/content/docs'), { recursive: true })
  await fs.mkdir(path.join(docsDir, 'src/content/writing'), { recursive: true })
  await fs.mkdir(path.join(docsDir, 'src/content/extensions'), { recursive: true })

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
    path.join(docsDir, 'src/content/extensions/about.md'),
    `---
title: About
description: About page
---

About extension page content.
`,
    'utf8',
  )

  const snapshot = await createContentSnapshot(docsDir)
  assert.equal(snapshot.length, 3)
  assert.deepEqual(
    snapshot.map(item => item.section).sort(),
    ['docs', 'extensions', 'writing'],
  )
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

test('resolveDeployTarget keeps external URI targets generic', () => {
  const plan = resolveDeployTarget({
    projectRoot: '/tmp/project',
    target: 's3://my-bucket/docs',
  })
  assert.equal(plan.kind, 'external-target')
  if (plan.kind === 'external-target') {
    assert.equal(plan.target, 's3://my-bucket/docs')
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
