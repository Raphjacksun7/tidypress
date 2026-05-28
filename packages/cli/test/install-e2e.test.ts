/**
 * Real install e2e: npm pack tidypress → npm install tarball in clean dir → CLI subprocess init/build.
 * Not workspace-linked BuildService shortcuts.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'

import {
  installTidyPressTarball,
  packTidyPressTarball,
  runInstalledCli,
  scaffoldInstalledPresetSite,
} from './support/install-e2e-helpers.js'

const tarballPromise = packTidyPressTarball()

test('packed tidypress installs and prints version', { timeout: 600_000 }, async () => {
  const tarball = await tarballPromise
  const { installRoot, cliPath } = await installTidyPressTarball(tarball)
  const { stdout } = await runInstalledCli(cliPath, ['--version'], installRoot)
  assert.match(stdout.trim(), /^\d+\.\d+\.\d+/)
})

test('installed lab: init + build + writing/projects/rss/pagefind', { timeout: 900_000 }, async () => {
  const tarball = await tarballPromise
  const { siteRoot, docsDir, buildDir, cliPath } = await scaffoldInstalledPresetSite(tarball, 'lab')

  const config = await fs.readFile(path.join(docsDir, 'tidypress.config.ts'), 'utf8')
  assert.match(config, /"kind": "projects"/)
  assert.doesNotMatch(config, /"enabled": true,\s*"basePath": "\/docs"/)

  const homeHtml = await fs.readFile(path.join(buildDir, 'index.html'), 'utf8')
  assert.match(homeHtml, /tidy-home-section-title">writing/)
  assert.match(homeHtml, /tidy-home-section-title">projects/)
  assert.match(homeHtml, /search-filters/)
  assert.match(homeHtml, /data-search-filter="writing"/)
  assert.match(homeHtml, /data-search-filter="projects"/)

  const writingHtml = await fs.readFile(path.join(buildDir, 'writing/hello/index.html'), 'utf8')
  assert.match(writingHtml, /data-pagefind-filter="collection:writing"/)

  await fs.access(path.join(buildDir, 'writing/rss.xml'))
  await fs.access(path.join(buildDir, 'projects/index.html'))
  await fs.access(path.join(buildDir, 'pagefind/pagefind.js'))
  const llmsTxt = await fs.readFile(path.join(buildDir, 'llms.txt'), 'utf8')
  assert.match(llmsTxt, /### \[Hello\]/)
  assert.match(llmsTxt, /Use the writing collection/)

  await assert.rejects(() => fs.access(path.join(buildDir, 'docs/index.html')))
})

test('installed blog: writing-only site', { timeout: 900_000 }, async () => {
  const tarball = await tarballPromise
  const { buildDir } = await scaffoldInstalledPresetSite(tarball, 'blog')

  const homeHtml = await fs.readFile(path.join(buildDir, 'index.html'), 'utf8')
  assert.match(homeHtml, /tidy-home-section-title">writing/)
  assert.doesNotMatch(homeHtml, /href="\/projects/)
  assert.doesNotMatch(homeHtml, /tidy-hero/)

  await fs.access(path.join(buildDir, 'writing/rss.xml'))
  await assert.rejects(() => fs.access(path.join(buildDir, 'projects/index.html')))
})

test('installed persona: hero + about + projects', { timeout: 900_000 }, async () => {
  const tarball = await tarballPromise
  const { docsDir, buildDir } = await scaffoldInstalledPresetSite(tarball, 'persona')

  const config = await fs.readFile(path.join(docsDir, 'tidypress.config.ts'), 'utf8')
  assert.match(config, /"enabled": true/)
  assert.match(config, /"role":/)

  const homeHtml = await fs.readFile(path.join(buildDir, 'index.html'), 'utf8')
  assert.match(homeHtml, /tidy-hero/)
  assert.match(homeHtml, /tidy-home-section-title">projects/)

  await fs.access(path.join(buildDir, 'about/index.html'))
  await fs.access(path.join(buildDir, 'projects/highlight/index.html'))
})

test('installed lab: project tag index route', { timeout: 900_000 }, async () => {
  const tarball = await tarballPromise
  const { siteRoot, docsDir, buildDir, cliPath } = await scaffoldInstalledPresetSite(tarball, 'lab')

  await fs.writeFile(
    path.join(docsDir, 'src/content/projects/tagged.md'),
    `---
title: Tagged OSS
description: Tag index smoke fixture.
status: active
tags: [smoke-e2e]
---

Body.
`,
    'utf8',
  )

  await runInstalledCli(cliPath, ['build'], siteRoot)
  await fs.access(path.join(buildDir, 'projects/tags/smoke-e2e/index.html'))
})
