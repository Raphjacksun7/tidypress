import test from 'node:test'
import assert from 'node:assert/strict'

import { normalizeHome, withDefaults } from '../dist/index.js'

test('normalizeHome applies lab preset order and project cards when omitted', () => {
  const home = normalizeHome({ preset: 'lab' })
  assert.deepEqual(home?.order, ['writing', 'projects'])
  assert.equal(home?.collections?.projects?.layout, 'card')
  assert.equal(home?.collections?.projects?.showDescription, true)
})

test('normalizeHome keeps explicit order over preset', () => {
  const home = normalizeHome({ preset: 'lab', order: ['projects', 'writing'] })
  assert.deepEqual(home?.order, ['projects', 'writing'])
})

test('withDefaults resolves home.preset for blog', () => {
  const site = withDefaults({
    name: 'site',
    home: { preset: 'blog' },
    collections: {
      writing: { enabled: true, kind: 'writing', basePath: '/writing' },
    },
  })
  assert.deepEqual(site.home?.order, ['writing'])
})
