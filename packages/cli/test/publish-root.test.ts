import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import {
  DEFAULT_PUBLISH_ROOT_DIR,
  getSiteDir,
  resolvePublishRoot,
} from '../src/infrastructure/project/config.js'
import { TidyPressError } from '../src/errors/TidyPressError.js'

const MINIMAL_CONFIG = `export default { name: 'fixture', siteUrl: 'https://example.com' }`

test('getSiteDir resolves site/ under project root', () => {
  assert.equal(getSiteDir('/tmp/project'), path.resolve('/tmp/project', DEFAULT_PUBLISH_ROOT_DIR))
})

test('resolvePublishRoot finds site/ publish root', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tidypress-publish-root-'))
  const siteDir = path.join(root, DEFAULT_PUBLISH_ROOT_DIR)
  await fs.mkdir(path.join(siteDir, 'src/content/docs'), { recursive: true })
  await fs.writeFile(path.join(siteDir, 'tidypress.config.ts'), MINIMAL_CONFIG, 'utf8')

  const resolved = await resolvePublishRoot(root)
  assert.equal(resolved, siteDir)
})

test('resolvePublishRoot finds config at project root', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tidypress-publish-root-'))
  await fs.writeFile(path.join(root, 'tidypress.config.ts'), MINIMAL_CONFIG, 'utf8')

  const resolved = await resolvePublishRoot(root)
  assert.equal(resolved, root)
})

test('resolvePublishRoot finds a custom publish root folder', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tidypress-publish-root-'))
  const webDir = path.join(root, 'web')
  await fs.mkdir(webDir, { recursive: true })
  await fs.writeFile(path.join(webDir, 'tidypress.config.ts'), MINIMAL_CONFIG, 'utf8')

  const resolved = await resolvePublishRoot(root)
  assert.equal(resolved, webDir)
})

test('resolvePublishRoot honors TIDYPRESS_PUBLISH_ROOT', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tidypress-publish-root-'))
  const customDir = path.join(root, 'publish')
  await fs.mkdir(customDir, { recursive: true })
  await fs.writeFile(path.join(customDir, 'tidypress.config.ts'), MINIMAL_CONFIG, 'utf8')

  const previous = process.env.TIDYPRESS_PUBLISH_ROOT
  process.env.TIDYPRESS_PUBLISH_ROOT = 'publish'
  try {
    const resolved = await resolvePublishRoot(root)
    assert.equal(resolved, customDir)
  } finally {
    if (previous === undefined) {
      delete process.env.TIDYPRESS_PUBLISH_ROOT
    } else {
      process.env.TIDYPRESS_PUBLISH_ROOT = previous
    }
  }
})

test('resolvePublishRoot throws when multiple publish roots are found', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tidypress-publish-root-'))
  for (const name of ['alpha', 'beta']) {
    const dir = path.join(root, name)
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(path.join(dir, 'tidypress.config.ts'), MINIMAL_CONFIG, 'utf8')
  }

  await assert.rejects(() => resolvePublishRoot(root), error => {
    assert.ok(error instanceof TidyPressError)
    assert.equal(error.code, 'CONFIG_AMBIGUOUS')
    return true
  })
})
