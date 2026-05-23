import test from 'node:test'
import assert from 'node:assert/strict'
import { loadEngineModule } from '../test-support/engine-jiti.js'

const {
  localizeEntries,
  resolveLocale,
  switchLocalePath,
  withLocalePrefix,
} = loadEngineModule(import.meta.url, 'i18n/locale.ts')

test('resolveLocale identifies locale-prefixed routes', () => {
  const localeState = resolveLocale('/fr/docs/getting-started', {
    defaultLocale: 'en',
    locales: ['en', 'fr'],
  })

  assert.equal(localeState.activeLocale, 'fr')
  assert.equal(localeState.defaultLocale, 'en')
  assert.deepEqual(localeState.locales, ['en', 'fr'])
})

test('switchLocalePath keeps route shape while switching language', () => {
  assert.equal(
    switchLocalePath('/fr/docs/getting-started', 'en', {
      defaultLocale: 'en',
      locales: ['en', 'fr'],
    }),
    '/docs/getting-started',
  )
  assert.equal(
    switchLocalePath('/docs/getting-started', 'fr', {
      defaultLocale: 'en',
      locales: ['en', 'fr'],
    }),
    '/fr/docs/getting-started',
  )
  assert.equal(withLocalePrefix('/docs', 'fr'), '/fr/docs')
})

test('localizeEntries selects entries for active locale', () => {
  const entries = [
    { id: 'en/getting-started' },
    { id: 'fr/getting-started' },
    { id: 'overview' },
  ]
  const localeState = resolveLocale('/', {
    defaultLocale: 'en',
    locales: ['en', 'fr'],
  })

  const fr = localizeEntries(entries, localeState, 'fr')
  const en = localizeEntries(entries, localeState, 'en')

  assert.deepEqual(fr.map(entry => entry.slug), ['getting-started'])
  assert.deepEqual(en.map(entry => entry.slug), ['getting-started', 'overview'])
})
