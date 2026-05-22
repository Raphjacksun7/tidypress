import test from 'node:test'
import assert from 'node:assert/strict'

import { withDefaults } from '../dist/index.js'

test('withDefaults accepts docs-scoped versions config', () => {
  const config = withDefaults({
    name: 'site',
    versions: [
      { label: 'v1.0', path: '/docs/v1.0' },
      { label: 'v2.0', path: '/docs/v2.0' },
    ],
  })

  assert.deepEqual(config.versions, [
    { label: 'v1.0', path: '/docs/v1.0' },
    { label: 'v2.0', path: '/docs/v2.0' },
  ])
})

test('withDefaults rejects version paths outside docs collection', () => {
  assert.throws(
    () =>
      withDefaults({
        name: 'site',
        sections: {
          docs: { basePath: '/reference' },
        },
        versions: [{ label: 'v1.0', path: '/docs/v1.0' }],
      }),
    /must live under/i,
  )
})

test('withDefaults rejects duplicate version labels and paths', () => {
  assert.throws(
    () =>
      withDefaults({
        name: 'site',
        versions: [
          { label: 'v1.0', path: '/docs/v1.0' },
          { label: 'v1.0', path: '/docs/v2.0' },
        ],
      }),
    /duplicate versions\[\]\.label/i,
  )

  assert.throws(
    () =>
      withDefaults({
        name: 'site',
        versions: [
          { label: 'v1.0', path: '/docs/v1.0' },
          { label: 'v2.0', path: '/docs/v1.0' },
        ],
      }),
    /duplicate versions\[\]\.path/i,
  )
})
