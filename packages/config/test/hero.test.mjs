import test from 'node:test'
import assert from 'node:assert/strict'
import {
  heroHasRenderableContent,
  normalizeHero,
  pickHeroConfigFields,
  withDefaults,
} from '../dist/index.js'

test('normalizeHero keeps hero only when enabled is true', () => {
  assert.equal(normalizeHero(undefined), undefined)
  assert.equal(normalizeHero({ role: 'Engineer' }), undefined)
  assert.equal(normalizeHero({ enabled: false, role: 'Engineer' }), undefined)
  assert.deepEqual(normalizeHero({ enabled: true, role: 'Engineer' }), {
    enabled: true,
    role: 'Engineer',
  })
})

test('heroHasRenderableContent includes image', () => {
  assert.equal(heroHasRenderableContent({ enabled: true, image: '/images/me.jpg' }), true)
})

test('pickHeroConfigFields copies scalar registry fields only when set', () => {
  assert.deepEqual(
    pickHeroConfigFields({
      enabled: true,
      role: 'Engineer',
      lead: 'Hello',
      links: [{ label: 'GitHub', href: 'https://github.com' }],
    }),
    {
      enabled: true,
      role: 'Engineer',
      lead: 'Hello',
      links: [{ label: 'GitHub', href: 'https://github.com' }],
    },
  )
})

test('withDefaults drops hero unless enabled is true', () => {
  assert.equal(
    withDefaults({ name: 'site', hero: { role: 'hidden' } }).hero,
    undefined,
  )
  assert.deepEqual(
    withDefaults({ name: 'site', hero: { enabled: true, role: 'shown' } }).hero,
    { enabled: true, role: 'shown' },
  )
})
