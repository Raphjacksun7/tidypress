import test from 'node:test'
import assert from 'node:assert/strict'

import { resolveSearchFilterCollections, withDefaults } from '../dist/index.js'

test('resolveSearchFilterCollections excludes page collections', () => {
  const site = withDefaults({
    name: 'Site',
    collections: {
      writing: { enabled: true, kind: 'writing', label: 'Writing' },
      projects: { enabled: true, kind: 'projects', label: 'Projects' },
      pages: { enabled: true, kind: 'page' },
    },
  })

  const keys = resolveSearchFilterCollections(site).map(c => c.key)
  assert.ok(keys.includes('writing'))
  assert.ok(keys.includes('projects'))
  assert.equal(keys.includes('pages'), false)
})
