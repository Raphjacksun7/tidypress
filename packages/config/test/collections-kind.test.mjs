import test from 'node:test'
import assert from 'node:assert/strict'

import { withDefaults } from '../dist/index.js'

test('withDefaults rejects kind "docs" on non-docs collections', () => {
  assert.throws(
    () =>
      withDefaults({
        name: 'site',
        collections: {
          playbooks: { enabled: true, basePath: '/playbooks', kind: 'docs' },
        },
      }),
    /kind "docs" is not allowed/,
  )
})

test('withDefaults rejects kind on collections.docs', () => {
  assert.throws(
    () =>
      withDefaults({
        name: 'site',
        collections: {
          docs: { enabled: true, basePath: '/docs', kind: 'content' },
        },
      }),
    /collections\.docs must not set kind/,
  )
})

test('withDefaults omits kind on collections.docs', () => {
  const config = withDefaults({ name: 'site' })
  assert.equal(config.collections?.docs?.kind, undefined)
  assert.equal(config.collections?.writing?.kind, 'writing')
})
