import test from 'node:test'
import assert from 'node:assert/strict'

import { withDefaults } from '../dist/index.js'

test('withDefaults injects extension nav entries when navLabel is provided', () => {
  const config = withDefaults({
    name: 'site',
    extensions: {
      customPages: [
        { slug: 'about', title: 'About', navLabel: 'about' },
      ],
    },
  })

  assert.deepEqual(
    config.nav?.map(item => item.href),
    ['/docs', '/writing', '/about'],
  )
})

test('withDefaults rejects reserved extension slugs', () => {
  assert.throws(
    () =>
      withDefaults({
        name: 'site',
        extensions: {
          customPages: [{ slug: 'docs', title: 'Docs override' }],
        },
      }),
    /reserved/i,
  )
})

test('withDefaults rejects duplicate extension slugs', () => {
  assert.throws(
    () =>
      withDefaults({
        name: 'site',
        extensions: {
          customPages: [
            { slug: 'about', title: 'About 1' },
            { slug: 'about', title: 'About 2' },
          ],
        },
      }),
    /duplicate/i,
  )
})
