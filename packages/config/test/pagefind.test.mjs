import test from 'node:test'
import assert from 'node:assert/strict'

import { pagefindCollectionFilter, resolvePagefindContentAttributes } from '../dist/index.js'

test('pagefindCollectionFilter uses collection namespace', () => {
  assert.equal(pagefindCollectionFilter('writing'), 'collection:writing')
  assert.equal(pagefindCollectionFilter(undefined), undefined)
})

test('resolvePagefindContentAttributes ignores or filters', () => {
  assert.deepEqual(resolvePagefindContentAttributes({ pagefindIgnore: true }), {
    'data-pagefind-ignore': true,
  })
  assert.deepEqual(
    resolvePagefindContentAttributes({ collectionKey: 'docs' }),
    { 'data-pagefind-filter': 'collection:docs' },
  )
  assert.deepEqual(resolvePagefindContentAttributes({}), {})
})
