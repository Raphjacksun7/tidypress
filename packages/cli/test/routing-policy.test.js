import test from 'node:test'
import assert from 'node:assert/strict'
import { withDefaults } from '../../config/dist/index.js'
import { loadEngineModule } from '../test-support/engine-jiti.js'

const { buildDocsRouteMatrix } = loadEngineModule(import.meta.url, 'routing/docs-route-matrix.ts')
const { switchLocaleTarget, versionSelectorState, isDocsPath } = loadEngineModule(
  import.meta.url,
  'routing/route-equivalents.ts',
)
const { WritingStrategy } = loadEngineModule(import.meta.url, 'routing/strategies/WritingStrategy.ts')

function site() {
  return withDefaults({
    name: 'Routing fixture',
    i18n: {
      defaultLocale: 'en',
      locales: ['en', 'fr'],
    },
    versions: [
      { label: 'v2', path: '/docs/v2' },
      { label: 'v1', path: '/docs/v1' },
    ],
  })
}

function routePaths(routes) {
  return routes.map(route => route.path).sort()
}

test('docs route matrix uses root default locale and locale-prefixed fallbacks', () => {
  const routes = buildDocsRouteMatrix(site(), 'docs', [
    { id: 'configuration', data: { title: 'Configuration' } },
    { id: 'fr/getting-started', data: { title: 'Premiers pas' } },
    { id: 'v2/configuration', data: { title: 'Configuration v2' } },
    { id: 'v2/whats-new', data: { title: 'What is new' } },
    { id: 'v1/configuration', data: { title: 'Configuration v1' } },
  ])
  const paths = routePaths(routes)

  assert.ok(paths.includes('/docs/configuration'))
  assert.ok(paths.includes('/docs/v2/configuration'))
  assert.ok(paths.includes('/docs/v2'))
  assert.ok(paths.includes('/fr/docs/configuration'))
  assert.ok(paths.includes('/fr/docs/v2/configuration'))
  assert.ok(paths.includes('/fr/docs/v2'))
  assert.ok(paths.includes('/fr/docs/getting-started'))
  assert.ok(!paths.some(path => path.startsWith('/en/')))
  assert.equal(new Set(paths).size, paths.length)

  const fallback = routes.find(route => route.path === '/fr/docs/v2/configuration')
  assert.equal(fallback?.entryId, 'v2/configuration')
  assert.equal(fallback?.fallbackReason, 'default-locale-content')
})

test('docs route matrix prefers translated content over default fallback', () => {
  const routes = buildDocsRouteMatrix(site(), 'docs', [
    { id: 'v2/configuration', data: { title: 'Configuration v2' } },
    { id: 'fr/v2/configuration', data: { title: 'Configuration v2 FR' } },
  ])

  const translated = routes.find(route => route.path === '/fr/docs/v2/configuration')
  assert.equal(translated?.entryId, 'fr/v2/configuration')
  assert.equal(translated?.fallbackReason, undefined)
})

test('version selector targets only valid equivalents and falls back to version root', () => {
  const config = site()
  const entries = [
    { id: 'configuration' },
    { id: 'v2/configuration' },
    { id: 'v1/getting-started' },
  ]
  const state = versionSelectorState(config, '/fr/docs/configuration', entries)

  assert.equal(state.targets['/fr/docs/v2'], '/fr/docs/v2/configuration')
  assert.equal(state.targets['/fr/docs/v1'], '/fr/docs/v1')
})

test('locale target keeps root default locale canonical', () => {
  const config = site()

  assert.equal(switchLocaleTarget('/fr/docs/v2/configuration', 'en', config), '/docs/v2/configuration')
  assert.equal(switchLocaleTarget('/docs/v2/configuration', 'fr', config), '/fr/docs/v2/configuration')
  assert.equal(isDocsPath('/', config), false)
  assert.equal(isDocsPath('/writing', config), false)
  assert.equal(isDocsPath('/fr/docs/v2/configuration', config), true)
})

test('writing strategy emits root default and non-default locale routes without version routes', () => {
  const config = site()
  const strategy = new WritingStrategy()
  const routes = strategy.plan({
    site: config,
    collection: {
      key: 'writing',
      kind: 'writing',
      enabled: true,
      basePath: '/writing',
      label: 'writing',
    },
    entries: [
      { id: 'hello', data: { title: 'Hello' } },
      { id: 'fr/bonjour', data: { title: 'Bonjour' } },
    ],
    locales: ['en', 'fr'],
    defaultLocale: 'en',
    usesLocaleRouting: true,
  })
  const paths = routePaths(routes)

  assert.ok(paths.includes('/writing'))
  assert.ok(paths.includes('/writing/hello'))
  assert.ok(paths.includes('/fr/writing'))
  assert.ok(paths.includes('/fr/writing/bonjour'))
  assert.ok(!paths.includes('/writing/fr/bonjour'))
  assert.ok(!paths.some(path => path.startsWith('/en/')))
  assert.ok(!paths.some(path => path.includes('/v2')))
})
