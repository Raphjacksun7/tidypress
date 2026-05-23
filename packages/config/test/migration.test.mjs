import test from 'node:test'
import assert from 'node:assert/strict'

import { migrateSectionsToCollections } from '../dist/index.js'

test('migrateSectionsToCollections moves legacy sections into collections', () => {
  const result = migrateSectionsToCollections({
    name: 'site',
    sections: {
      docs: { enabled: true, basePath: '/reference' },
      writing: { enabled: false, basePath: '/notes' },
    },
  })

  assert.equal(result.migrated, true)
  assert.deepEqual(result.config.sections, undefined)
  assert.deepEqual(result.config.collections?.docs, {
    enabled: true,
    basePath: '/reference',
    label: 'docs',
  })
  assert.deepEqual(result.config.collections?.writing, {
    enabled: false,
    basePath: '/notes',
    kind: 'writing',
    label: 'writing',
  })
})

test('migrateSectionsToCollections preserves explicit collections over legacy sections', () => {
  const result = migrateSectionsToCollections({
    name: 'site',
    collections: {
      docs: { enabled: true, basePath: '/docs', label: 'docs' },
    },
    sections: {
      docs: { enabled: true, basePath: '/legacy-docs' },
      writing: { enabled: true, basePath: '/writing' },
    },
  })

  assert.equal(result.migrated, true)
  assert.equal(result.config.collections?.docs?.basePath, '/docs')
  assert.equal(result.config.collections?.writing?.basePath, '/writing')
  assert.match(result.notes.join(' '), /ignored legacy sections\.docs/i)
})

test('migrateSectionsToCollections supports preserveSections option', () => {
  const result = migrateSectionsToCollections(
    {
      name: 'site',
      sections: {
        docs: { enabled: true, basePath: '/docs' },
      },
    },
    { preserveSections: true },
  )

  assert.equal(result.config.sections?.docs?.basePath, '/docs')
  assert.equal(result.config.collections?.docs?.basePath, '/docs')
})

