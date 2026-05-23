import test from 'node:test'
import assert from 'node:assert/strict'
import {
  mergeListDisplay,
  resolveCollectionIndexDisplay,
  resolveDefaultHomeSectionKeys,
  resolveHomeCollectionDisplay,
  listGapStackClass,
  isCardListLayout,
  listLayoutPresentation,
} from '../dist/index.js'

test('mergeListDisplay keeps list defaults', () => {
  assert.deepEqual(mergeListDisplay(), {
    layout: 'list',
    gap: 'sm',
    showDescription: false,
    showTags: false,
    showDate: false,
    icon: undefined,
  })
})

test('resolveHomeCollectionDisplay merges home and collection overrides', () => {
  const resolved = resolveHomeCollectionDisplay(
    { display: { layout: 'card', gap: 'md' } },
    { icon: '/global.svg' },
    { showDescription: false, icon: '/docs.svg' },
  )

  assert.equal(resolved.layout, 'card')
  assert.equal(resolved.gap, 'md')
  assert.equal(resolved.showDescription, false)
  assert.equal(resolved.icon, '/docs.svg')
})

test('resolveHomeCollectionDisplay keeps homepage descriptions opt-in', () => {
  const inherited = resolveHomeCollectionDisplay(
    undefined,
    { layout: 'card', showDescription: true },
    undefined,
  )
  const explicit = resolveHomeCollectionDisplay(
    undefined,
    { layout: 'card', showDescription: false },
    { showDescription: true },
  )

  assert.equal(inherited.showDescription, false)
  assert.equal(explicit.showDescription, true)
})

test('resolveDefaultHomeSectionKeys orders built-in sections and includes content collections', () => {
  const keys = resolveDefaultHomeSectionKeys({
    name: 'site',
    collections: {
      docs: { enabled: true },
      writing: { enabled: true },
      playbooks: { enabled: true, kind: 'content', label: 'Playbooks' },
      legal: { enabled: true, kind: 'page' },
    },
  })

  assert.deepEqual(keys, ['writing', 'docs', 'playbooks'])
})

test('listGapStackClass and isCardListLayout read display registry', () => {
  assert.equal(listGapStackClass('sm'), 'space-y-2')
  assert.equal(listGapStackClass('md'), 'space-y-3')
  assert.equal(isCardListLayout('card'), true)
  assert.equal(isCardListLayout('list'), false)
  assert.equal(listLayoutPresentation('list').rowClass, 'home-list-row')
})

test('resolveCollectionIndexDisplay reads collection display', () => {
  const resolved = resolveCollectionIndexDisplay({
    layout: 'card',
    showTags: true,
  })

  assert.equal(resolved.layout, 'card')
  assert.equal(resolved.showTags, true)
})
