import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import createJiti from 'jiti'

import { withDefaults } from '@docsmint/config'

const jiti = createJiti(import.meta.url)
const {
  getEnabledContentCollections,
  getCollectionBasePath,
  getCollectionEntryPath,
  getCollectionEntrySlug,
  isLegacyStarterCollectionKey,
  isCollectionEnabled,
} = jiti('../../engine/src/domain/content/collections.ts')
const { toCollectionAwareContentId } = jiti('../../engine/src/domain/content/content-loader.ts')
const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..')

async function walkSourceFiles(rootDir) {
  const files = []
  const entries = await fs.readdir(rootDir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walkSourceFiles(fullPath)))
      continue
    }
    if (!entry.isFile()) {
      continue
    }
    if (/\.(astro|ts|js)$/.test(entry.name)) {
      files.push(fullPath)
    }
  }
  return files
}

test('collection helpers preserve legacy docs and writing paths', () => {
  const site = withDefaults({ name: 'site' })

  assert.equal(getCollectionBasePath(site, 'docs'), '/docs')
  assert.equal(getCollectionBasePath(site, 'writing'), '/writing')
  assert.equal(isCollectionEnabled(site, 'docs'), true)
  assert.equal(isCollectionEnabled(site, 'writing'), true)
  assert.equal(getCollectionEntrySlug('guides/start.mdx'), 'guides/start')
  assert.equal(getCollectionEntryPath(site, 'docs', 'guides/start.mdx'), '/docs/guides/start')
  assert.equal(getCollectionEntryPath(site, 'writing', 'weekly-update.md'), '/writing/weekly-update')
  assert.equal(isLegacyStarterCollectionKey(site, 'docs'), true)
  assert.equal(isLegacyStarterCollectionKey(site, 'writing'), true)
  assert.equal(isLegacyStarterCollectionKey(site, 'playbooks'), false)
})

test('collection helpers read from new collections registry', () => {
  const site = withDefaults({
    name: 'site',
    collections: {
      docs: { enabled: false, basePath: '/reference' },
      writing: { enabled: true, basePath: '/notes' },
    },
  })

  assert.equal(isCollectionEnabled(site, 'docs'), false)
  assert.equal(getCollectionBasePath(site, 'docs'), '/reference')
  assert.equal(getCollectionBasePath(site, 'writing'), '/notes')
  assert.equal(getCollectionEntryPath(site, 'writing', 'team/retro.mdx'), '/notes/team/retro')
})

test('collection-aware content ids keep current id shape', () => {
  assert.equal(toCollectionAwareContentId('docs', 'guides/setup.mdx'), 'guides/setup')
  assert.equal(toCollectionAwareContentId('writing', 'changelog/2026-05-21.md'), 'changelog/2026-05-21')
  assert.equal(toCollectionAwareContentId('pages', 'about/contact.mdx'), 'about/contact')
  assert.equal(toCollectionAwareContentId('playbooks', 'incident-response.md'), 'incident-response')
  assert.equal(toCollectionAwareContentId('docs', 'guides\\windows-path.md'), 'guides/windows-path')
})

test('collection helpers expose arbitrary enabled collections from registry', () => {
  const site = withDefaults({
    name: 'site',
    collections: {
      playbooks: {
        enabled: true,
        basePath: '/playbooks',
        kind: 'docs',
        label: 'playbooks',
      },
    },
  })

  const enabled = getEnabledContentCollections(site)
  assert.ok(enabled.some(collection => collection.key === 'playbooks' && collection.basePath === '/playbooks'))
  assert.equal(getCollectionBasePath(site, 'playbooks'), '/playbooks')
})

test('collection helpers support arbitrary collection keys across all kinds', () => {
  const site = withDefaults({
    name: 'site',
    collections: {
      manuals: {
        enabled: true,
        basePath: '/manuals',
        kind: 'docs',
        label: 'manuals',
      },
      logs: {
        enabled: true,
        basePath: '/logs',
        kind: 'writing',
        label: 'logs',
      },
      company: {
        enabled: true,
        basePath: '/company',
        kind: 'page',
        label: 'company',
      },
    },
  })

  const enabled = getEnabledContentCollections(site)
  assert.deepEqual(
    enabled.map(collection => collection.key).sort(),
    ['docs', 'logs', 'manuals', 'writing'],
  )
  assert.deepEqual(
    enabled.map(collection => collection.kind).sort(),
    ['docs', 'docs', 'writing', 'writing'],
  )
  assert.equal(getCollectionEntryPath(site, 'manuals', 'setup/install.mdx'), '/manuals/setup/install')
  assert.equal(getCollectionEntryPath(site, 'logs', 'notes/week-01.md'), '/logs/notes/week-01')
  assert.equal(isLegacyStarterCollectionKey(site, 'manuals'), false)
})

test('legacy key branching is confined to compatibility shim', async () => {
  const srcFiles = [
    ...(await walkSourceFiles(path.resolve(workspaceRoot, 'packages/config/src'))),
    ...(await walkSourceFiles(path.resolve(workspaceRoot, 'packages/engine/src'))),
    ...(await walkSourceFiles(path.resolve(workspaceRoot, 'packages/cli/src'))),
  ]
  const compatibilityFiles = new Set([
    path.resolve(workspaceRoot, 'packages/config/src/legacy.ts'),
  ])
  const forbiddenLegacyBranching = /\b(?:key|collectionKey)\s*===\s*['"](docs|writing|pages)['"]|case\s+['"](docs|writing|pages)['"]/g

  for (const filePath of srcFiles) {
    if (compatibilityFiles.has(filePath)) {
      continue
    }
    const source = await fs.readFile(filePath, 'utf8')
    assert.doesNotMatch(source, forbiddenLegacyBranching)
  }

  const compatShim = await fs.readFile(
    path.resolve(workspaceRoot, 'packages/config/src/legacy.ts'),
    'utf8',
  )
  assert.match(compatShim, /starterCollectionKeys/)
  assert.match(compatShim, /legacySectionKeys/)
})
