import test from 'node:test'
import assert from 'node:assert/strict'

import {
  collectionKindRouteModes,
  collectionKindShellLayout,
  resolveCollectionKind,
} from '../dist/registry/collection-kinds.js'

test('collection kind registry defines shell layout and route modes', () => {
  assert.equal(collectionKindShellLayout('projects'), 'writing')
  assert.equal(collectionKindShellLayout('content'), 'docs')
  assert.deepEqual(collectionKindRouteModes('writing'), ['collection-index', 'collection-entry'])
  assert.ok(collectionKindRouteModes('content').includes('version-root'))
})

test('resolveCollectionKind falls back to content', () => {
  assert.equal(resolveCollectionKind(undefined), 'content')
  assert.equal(resolveCollectionKind('bogus'), 'content')
  assert.equal(resolveCollectionKind('projects'), 'projects')
})
