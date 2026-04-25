import test from 'node:test'
import assert from 'node:assert/strict'

import { withDefaults } from '../dist/index.js'

test('withDefaults injects page nav entries when navLabel is provided', () => {
  const config = withDefaults({
    name: 'site',
    pages: [{ slug: 'about', navLabel: 'about' }],
  })

  assert.deepEqual(
    config.nav?.map(item => item.href),
    ['/docs', '/writing', '/about'],
  )
})

test('withDefaults rejects reserved page slugs', () => {
  assert.throws(
    () =>
      withDefaults({
        name: 'site',
        pages: [{ slug: 'docs' }],
      }),
    /reserved/i,
  )
})

test('withDefaults rejects duplicate page slugs', () => {
  assert.throws(
    () =>
      withDefaults({
        name: 'site',
        pages: [{ slug: 'about' }, { slug: 'about' }],
      }),
    /duplicate/i,
  )
})
