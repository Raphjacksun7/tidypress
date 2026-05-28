import test from 'node:test'
import assert from 'node:assert/strict'

import {
  publicationSurfaceDefinitions,
  publicationSurfaceFooterNavItems,
  publicationSurfaceHomeOrder,
  publicationSurfaceKeys,
  publicationSurfaceNavHref,
  publicationSurfaceHomeCollections,
  publicationSurfacePrimaryNavDefinitions,
} from '../dist/registry/publication-surfaces.js'

test('publication surfaces define body-of-work keys (docs is a separate preset)', () => {
  assert.equal(publicationSurfaceKeys.length, 6)
  assert.equal(publicationSurfaceKeys.includes('docs'), false)
  assert.deepEqual(
    publicationSurfaceDefinitions.map(surface => surface.key),
    [...publicationSurfaceKeys],
  )
})

test('home order and layout derive from surface registry', () => {
  assert.deepEqual(publicationSurfaceHomeOrder(), ['works', 'projects', 'writing'])
  const homeCollections = publicationSurfaceHomeCollections()
  assert.equal(homeCollections.works.layout, 'card')
  assert.equal(homeCollections.writing.showDate, true)
})

test('pages surface nav uses page slug href', () => {
  const pages = publicationSurfaceDefinitions.find(surface => surface.key === 'pages')
  assert.ok(pages)
  assert.equal(publicationSurfaceNavHref(pages), '/about')
})

test('primary nav and footer links split crowded body-of-work surfaces', () => {
  assert.deepEqual(
    publicationSurfacePrimaryNavDefinitions().map(surface => surface.key),
    ['works', 'projects', 'writing'],
  )
  assert.deepEqual(publicationSurfaceFooterNavItems(), [
    { label: 'reference', href: '/reference' },
    { label: 'process', href: '/process' },
  ])
})
