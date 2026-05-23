import test from 'node:test'
import assert from 'node:assert/strict'

import { withDefaults } from '../dist/index.js'

test('withDefaults keeps guardrailed theme baseline by default', () => {
  const config = withDefaults({ name: 'site' })
  assert.equal(config.theme?.mode, 'guardrailed')
  assert.equal(config.theme?.preset, 'baseline')
  assert.equal(config.theme?.code?.preset, 'claude')
  assert.deepEqual(Object.keys(config.theme?.tokens?.light ?? {}).sort(), [
    'bg',
    'border',
    'codeBg',
    'codeFg',
    'fg',
    'muted',
    'surface',
  ])
  assert.deepEqual(Object.keys(config.theme?.tokens?.dark ?? {}).sort(), [
    'bg',
    'border',
    'codeBg',
    'codeFg',
    'fg',
    'muted',
    'surface',
  ])
})

test('withDefaults requires themingCustom capability for custom mode', () => {
  assert.throws(
    () =>
      withDefaults({
        name: 'site',
        theme: {
          mode: 'custom',
          tokens: {
            light: { bg: '#ffffff' },
            dark: { bg: '#000000' },
          },
        },
      }),
    /themingCustom/i,
  )
})

test('withDefaults merges custom theme tokens when capability is enabled', () => {
  const config = withDefaults({
    name: 'site',
    capabilities: {
      enable: ['themingCustom'],
    },
    theme: {
      mode: 'custom',
      tokens: {
        light: { bg: '#ffffff', fg: '#111111' },
        dark: { bg: '#020202', fg: '#fefefe' },
      },
    },
  })

  assert.equal(config.theme?.mode, 'custom')
  assert.equal(config.theme?.tokens?.light?.bg, '#ffffff')
  assert.equal(config.theme?.tokens?.light?.fg, '#111111')
  assert.equal(config.theme?.tokens?.dark?.bg, '#020202')
  assert.equal(config.theme?.tokens?.dark?.fg, '#fefefe')
  // Engine render contract: full V1 token surface is always present.
  assert.equal(typeof config.theme?.tokens?.light?.surface, 'string')
  assert.equal(typeof config.theme?.tokens?.dark?.surface, 'string')
})

test('withDefaults rejects custom token keys outside V1 surface', () => {
  assert.throws(
    () =>
      withDefaults({
        name: 'site',
        capabilities: {
          enable: ['themingCustom'],
        },
        theme: {
          mode: 'custom',
          tokens: {
            light: { accent: '#ff00ff' },
            dark: { bg: '#000000' },
          },
        },
      }),
    /unsupported token/i,
  )
})

test('withDefaults forces guardrailed baseline when theming capability is disabled', () => {
  const config = withDefaults({
    name: 'site',
    capabilities: {
      disable: ['theming'],
      enable: ['themingCustom'],
    },
    theme: {
      mode: 'custom',
      tokens: {
        light: { bg: '#ffffff' },
        dark: { bg: '#000000' },
      },
    },
  })

  assert.equal(config.theme?.mode, 'guardrailed')
  assert.equal(config.theme?.preset, 'baseline')
  assert.notEqual(config.theme?.tokens?.light?.bg, '#ffffff')
  assert.notEqual(config.theme?.tokens?.dark?.bg, '#000000')
})

test('withDefaults validates theme.code.preset values', () => {
  assert.throws(
    () =>
      withDefaults({
        name: 'site',
        theme: {
          code: {
            preset: /** @type {any} */ ('jetbrainz'),
          },
        },
      }),
    /theme\.code\.preset/i,
  )
})
