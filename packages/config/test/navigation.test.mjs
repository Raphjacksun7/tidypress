import test from 'node:test'
import assert from 'node:assert/strict'

import { buildNavigationModel, withDefaults } from '../dist/index.js'

test('buildNavigationModel keeps desktop/mobile nav within budgets', () => {
  const config = withDefaults({
    name: 'site',
    nav: [
      { label: 'docs', href: '/docs', priority: 'core' },
      { label: 'writing', href: '/writing', priority: 'core' },
      { label: 'about', href: '/about' },
      { label: 'projects', href: '/projects' },
    ],
    navPolicy: {
      mode: 'strict',
      maxVisibleDesktop: 3,
      maxVisibleMobile: 2,
    },
  })

  const model = buildNavigationModel(config)
  assert.equal(model.desktop.visible.length, 3)
  assert.equal(model.desktop.overflow.length, 1)
  assert.equal(model.mobile.visible.length, 2)
  assert.equal(model.mobile.overflow.length, 2)
})

test('withDefaults rejects too many core nav items in strict mode', () => {
  assert.throws(
    () =>
      withDefaults({
        name: 'site',
        nav: [
          { label: 'docs', href: '/docs', priority: 'core' },
          { label: 'writing', href: '/writing', priority: 'core' },
          { label: 'about', href: '/about', priority: 'core' },
          { label: 'projects', href: '/projects', priority: 'core' },
        ],
        navPolicy: {
          mode: 'strict',
          maxVisibleDesktop: 3,
          maxVisibleMobile: 2,
        },
      }),
    /core nav items/i,
  )
})

test('withDefaults auto-adds noopener noreferrer for _blank external links', () => {
  const config = withDefaults({
    name: 'site',
    nav: [
      {
        label: 'github',
        href: 'https://github.com',
        target: '_blank',
      },
    ],
  })

  assert.equal(config.nav?.[0].external, true)
  assert.match(config.nav?.[0].rel ?? '', /noopener/)
  assert.match(config.nav?.[0].rel ?? '', /noreferrer/)
})

test('withDefaults keeps _self external links without forcing noopener', () => {
  const config = withDefaults({
    name: 'site',
    nav: [
      {
        label: 'homepage',
        href: 'https://example.com',
        target: '_self',
      },
    ],
  })

  assert.equal(config.nav?.[0].external, true)
  assert.equal(config.nav?.[0].target, '_self')
  assert.equal(config.nav?.[0].rel, undefined)
})

test('withDefaults supports string shorthand pages entries', () => {
  const config = withDefaults({
    name: 'site',
    pages: ['about'],
  })

  assert.equal(config.pages?.[0]?.slug, 'about')
})

test('withDefaults merges default section settings', () => {
  const config = withDefaults({
    name: 'site',
    sections: {
      writing: {
        enabled: false,
      },
    },
  })

  assert.equal(config.sections?.docs?.enabled, true)
  assert.equal(config.sections?.writing?.enabled, false)
  assert.equal(config.sections?.docs?.basePath, '/docs')
  assert.equal(config.collections?.docs?.enabled, true)
  assert.equal(config.collections?.writing?.enabled, false)
})

test('withDefaults supports collections registry and derives sections shim', () => {
  const config = withDefaults({
    name: 'site',
    collections: {
      docs: { basePath: '/reference' },
      writing: { enabled: false },
    },
  })

  assert.equal(config.collections?.docs?.basePath, '/reference')
  assert.equal(config.collections?.writing?.enabled, false)
  assert.equal(config.sections?.docs?.basePath, '/reference')
  assert.equal(config.sections?.writing?.enabled, false)
})

test('withDefaults enables arbitrary collection nav when configured', () => {
  const config = withDefaults({
    name: 'site',
    collections: {
      playbooks: { enabled: true, basePath: '/playbooks', label: 'playbooks', kind: 'content' },
    },
  })

  assert.deepEqual(config.nav, [
    { label: 'docs', href: '/docs', external: false, target: undefined, rel: undefined, priority: 'secondary' },
    { label: 'writing', href: '/writing', external: false, target: undefined, rel: undefined, priority: 'secondary' },
    { label: 'playbooks', href: '/playbooks', external: false, target: undefined, rel: undefined, priority: 'secondary' },
  ])
})

test('withDefaults keeps explicit collections when sections are also provided', () => {
  const config = withDefaults({
    name: 'site',
    sections: {
      docs: { basePath: '/legacy-docs' },
    },
    collections: {
      docs: { basePath: '/reference' },
    },
  })

  assert.equal(config.collections?.docs?.basePath, '/reference')
  assert.equal(config.sections?.docs?.basePath, '/reference')
})

test('withDefaults normalizes typography scale and supports "extra" alias', () => {
  const implicitDefault = withDefaults({ name: 'site' })
  assert.equal(implicitDefault.typography?.scale, 'medium')

  const medium = withDefaults({
    name: 'site',
    typography: { scale: 'medium' },
  })
  assert.equal(medium.typography?.scale, 'medium')

  const small = withDefaults({
    name: 'site',
    typography: { scale: 'small' },
  })
  assert.equal(small.typography?.scale, 'small')

  const defaultAlias = withDefaults({
    name: 'site',
    typography: { scale: 'default' },
  })
  assert.equal(defaultAlias.typography?.scale, 'medium')

  const extraAlias = withDefaults({
    name: 'site',
    typography: { scale: 'extra' },
  })
  assert.equal(extraAlias.typography?.scale, 'large')
})

test('withDefaults rejects unsupported typography scales', () => {
  assert.throws(
    () =>
      withDefaults({
        name: 'site',
        typography: { scale: 'huge' },
      }),
    /typography\.scale/i,
  )
})

test('withDefaults allows custom section base paths', () => {
  const config = withDefaults({
    name: 'site',
    sections: {
      docs: { basePath: '/reference' },
      writing: { basePath: '/notes' },
    },
  })
  assert.equal(config.sections?.docs?.basePath, '/reference')
  assert.equal(config.sections?.writing?.basePath, '/notes')
})

test('withDefaults uses section base paths for default nav links', () => {
  const config = withDefaults({
    name: 'site',
    collections: {
      docs: { basePath: '/reference' },
      writing: { basePath: '/notes' },
    },
  })

  assert.deepEqual(config.nav, [
    { label: 'docs', href: '/reference', external: false, target: undefined, rel: undefined, priority: 'secondary' },
    { label: 'writing', href: '/notes', external: false, target: undefined, rel: undefined, priority: 'secondary' },
  ])
})

test('withDefaults normalizes i18n locales and default locale', () => {
  const config = withDefaults({
    name: 'site',
    i18n: {
      locales: ['en', 'fr', 'fr'],
    },
  })

  assert.equal(config.i18n?.defaultLocale, 'en')
  assert.deepEqual(config.i18n?.locales, ['en', 'fr'])
})

test('withDefaults rejects default locale outside locales list', () => {
  assert.throws(
    () =>
      withDefaults({
        name: 'site',
        i18n: {
          defaultLocale: 'es',
          locales: ['en', 'fr'],
        },
      }),
    /defaultLocale/i,
  )
})
