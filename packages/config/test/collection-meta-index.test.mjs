import test from 'node:test'
import assert from 'node:assert/strict'

import {
  collectionMetaIndexSlug,
  parseCollectionMetaIndexSlug,
  resolveCollectionMetaIndexTitle,
} from '../dist/index.js'

test('collectionMetaIndexSlug builds tags and archive slugs', () => {
  assert.equal(collectionMetaIndexSlug('tags', 'astro'), 'tags/astro')
  assert.equal(collectionMetaIndexSlug('archive', '2024'), 'archive/2024')
})

test('parseCollectionMetaIndexSlug decodes tag values', () => {
  assert.equal(parseCollectionMetaIndexSlug('tags/hello%20world', 'tags'), 'hello world')
  assert.equal(parseCollectionMetaIndexSlug('archive/2024', 'archive'), '2024')
  assert.equal(parseCollectionMetaIndexSlug('hello', 'tags'), undefined)
})

test('resolveCollectionMetaIndexTitle formats meta index titles', () => {
  assert.equal(resolveCollectionMetaIndexTitle('Writing', 'tags/astro'), 'astro — Writing')
  assert.equal(resolveCollectionMetaIndexTitle('Writing', undefined), 'Writing')
})
