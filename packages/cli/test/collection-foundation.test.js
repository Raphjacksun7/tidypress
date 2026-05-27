import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { withDefaults } from '@tidypress/config'
import { loadEngineModule } from '../test-support/engine-jiti.js'

const {
  getEnabledContentCollections,
  getCollectionBasePath,
  getCollectionEntryPath,
  getCollectionEntrySlug,
  shouldLocalizeCollection,
  isCollectionEnabled,
} = loadEngineModule(import.meta.url, 'utils/collections.ts')
const { ContentStrategy: ContentRouteStrategy } = loadEngineModule(import.meta.url, 'routing/strategies/ContentStrategy.ts')
const { toCollectionAwareContentId } = loadEngineModule(import.meta.url, 'utils/content-loader.ts')
const {
  ROUTE_VIEW_REGISTRY,
  requiresRenderedEntry,
  listRouteViewKeys,
} = loadEngineModule(import.meta.url, 'routing/view-registry.ts')
const { resolveDocFormRouteViewKey, presentationScopeToViewPrefix } = loadEngineModule(
  import.meta.url,
  'routing/view-registry.ts',
)
const { buildDocChapterNav } = loadEngineModule(
  import.meta.url,
  'routing/chapter-nav.ts',
)
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
  assert.equal(shouldLocalizeCollection(site, 'docs'), false)
  assert.equal(shouldLocalizeCollection(withDefaults({
    name: 'site',
    i18n: { defaultLocale: 'en', locales: ['en', 'fr'] },
  }), 'docs'), true)
  assert.equal(shouldLocalizeCollection(site, 'playbooks'), false)
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
        kind: 'content',
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
        kind: 'content',
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
    ['content', 'docs', 'writing', 'writing'],
  )
  assert.equal(getCollectionEntryPath(site, 'manuals', 'setup/install.mdx'), '/manuals/setup/install')
  assert.equal(getCollectionEntryPath(site, 'logs', 'notes/week-01.md'), '/logs/notes/week-01')
  assert.equal(shouldLocalizeCollection(site, 'manuals'), false)
})

test('buildDocChapterNav links doc-form chapters in order', () => {
  const site = withDefaults({ name: 'site', collections: { docs: { enabled: true, basePath: '/docs' } } })
  const entries = [
    { id: 'intro.md', data: { title: 'Intro', form: 'manual' } },
    { id: 'ch-1.md', data: { title: 'Chapter 1', form: 'doc', order: 1 } },
    { id: 'ch-2.md', data: { title: 'Chapter 2', form: 'doc', order: 2 } },
    { id: 'ch-3.md', data: { title: 'Chapter 3', form: 'doc', order: 3 } },
  ]
  const nav = buildDocChapterNav(site, 'docs', entries, { slug: 'ch-2' })
  assert.equal(nav?.previous?.title, 'Chapter 1')
  assert.equal(nav?.previous?.href, '/docs/ch-1')
  assert.equal(nav?.next?.title, 'Chapter 3')
  assert.equal(nav?.next?.href, '/docs/ch-3')
})

test('doc form view keys use built-in prefixes on entry routes', () => {
  assert.equal(
    resolveDocFormRouteViewKey('manual', { mode: 'collection-entry' }),
    'manual:collection-entry',
  )
  assert.equal(
    resolveDocFormRouteViewKey('doc', { mode: 'version-root' }),
    'doc:version-root',
  )
  assert.equal(
    resolveDocFormRouteViewKey(undefined, { mode: 'collection-entry' }),
    'doc:collection-entry',
  )
  assert.equal(
    resolveDocFormRouteViewKey('manual', { mode: 'collection-index' }),
    'docs:collection-index',
  )
  assert.equal(presentationScopeToViewPrefix('form:playbook'), 'form-playbook')
})

test('route view registry declares rendered-entry requirements explicitly', () => {
  assert.ok(listRouteViewKeys().length >= ROUTE_VIEW_REGISTRY.length)
  for (const descriptor of ROUTE_VIEW_REGISTRY) {
    assert.equal(
      requiresRenderedEntry(descriptor.viewKey),
      descriptor.requiresRenderedEntry,
      `descriptor mismatch for ${descriptor.viewKey}`,
    )
  }
  const entryViews = ROUTE_VIEW_REGISTRY.filter(descriptor => descriptor.requiresRenderedEntry)
  assert.ok(!entryViews.some(descriptor => descriptor.viewKey === 'docs:collection-index'))
  assert.ok(entryViews.some(descriptor => descriptor.viewKey === 'manual:collection-entry'))
  assert.ok(entryViews.some(descriptor => descriptor.viewKey === 'doc:collection-entry'))
  assert.ok(entryViews.some(descriptor => descriptor.viewKey === 'page:root-page'))
  assert.ok(!entryViews.some(descriptor => descriptor.viewKey === 'writing:collection-index'))
})

test('ContentRouteStrategy plans reference collection paths without locale prefix', () => {
  const site = withDefaults({
    name: 'site',
    collections: {
      playbooks: {
        enabled: true,
        basePath: '/playbooks',
        kind: 'content',
        label: 'playbooks',
      },
    },
  })
  const strategy = new ContentRouteStrategy()
  const routes = strategy.plan({
    site,
    collection: {
      key: 'playbooks',
      kind: 'content',
      enabled: true,
      basePath: '/playbooks',
      label: 'playbooks',
    },
    entries: [{ id: 'intro.md', data: { title: 'Intro' } }],
    locales: [],
    defaultLocale: 'en',
    usesLocaleRouting: false,
  })
  const paths = routes.map(route => route.path)
  assert.ok(paths.includes('/playbooks'))
  assert.ok(paths.includes('/playbooks/intro'))
  assert.equal(paths.some(path => path.includes('/fr/playbooks')), false)
})

test('legacy key branching is confined to compatibility shim', async () => {
  const srcFiles = [
    ...(await walkSourceFiles(path.resolve(workspaceRoot, 'packages/config/src'))),
    ...(await walkSourceFiles(path.resolve(workspaceRoot, 'packages/engine/src'))),
    ...(await walkSourceFiles(path.resolve(workspaceRoot, 'packages/cli/src'))),
  ]
  const compatibilityFiles = new Set([
    path.resolve(workspaceRoot, 'packages/config/src/registry/legacy.ts'),
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
    path.resolve(workspaceRoot, 'packages/config/src/registry/legacy.ts'),
    'utf8',
  )
  assert.match(compatShim, /starterCollectionKeys/)
  assert.match(compatShim, /legacySectionKeys/)
})
