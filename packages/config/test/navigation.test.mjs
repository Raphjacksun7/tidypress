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
})

test('withDefaults normalizes typography scale and supports "extra" alias', () => {
  const medium = withDefaults({
    name: 'site',
    typography: { scale: 'medium' },
  })
  assert.equal(medium.typography?.scale, 'medium')

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

test('withDefaults rejects unsupported section base paths', () => {
  assert.throws(
    () =>
      withDefaults({
        name: 'site',
        sections: {
          docs: { basePath: '/reference' },
        },
      }),
    /supports only "\/docs"/i,
  )
})
