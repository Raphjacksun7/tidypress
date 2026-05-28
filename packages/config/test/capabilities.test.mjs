import test from 'node:test'
import assert from 'node:assert/strict'

import { resolveCapabilityFlags, resolveCapabilities, withDefaults } from '../dist/index.js'

test('resolveCapabilityFlags returns deterministic defaults', () => {
  const config = withDefaults({ name: 'site' })
  const flags = resolveCapabilityFlags(config)
  assert.deepEqual(flags, {
    docs: true,
    writing: true,
    pages: true,
    editor: false,
    export: false,
    ai: false,
    theming: true,
    themingCustom: false,
    llmsTxt: true,
  })
})

test('resolveCapabilityFlags honors config capability overrides', () => {
  const config = withDefaults({
    name: 'site',
    collections: {
      docs: { enabled: false },
      writing: { enabled: true },
      pages: { enabled: true },
    },
    experimental: {
      ai: false,
    },
    capabilities: {
      enable: ['docs', 'ai'],
      disable: ['writing'],
    },
  })

  const flags = resolveCapabilityFlags(config)
  assert.equal(flags.docs, true)
  assert.equal(flags.writing, false)
  assert.equal(flags.ai, true)
})

test('resolveCapabilities applies explicit runtime overrides deterministically', () => {
  const config = withDefaults({ name: 'site' })
  const state = resolveCapabilities(config, {
    disable: ['docs'],
    enable: ['editor'],
  })

  assert.equal(state.docs.enabled, false)
  assert.equal(state.docs.source, 'override-disable')
  assert.equal(state.editor.enabled, true)
  assert.equal(state.editor.source, 'override-enable')
})

test('resolveCapabilityFlags honors theming capability precedence deterministically', () => {
  const config = withDefaults({
    name: 'site',
    capabilities: {
      enable: ['themingCustom'],
      disable: ['theming'],
    },
  })

  const flags = resolveCapabilityFlags(config, {
    enable: ['theming'],
    disable: ['themingCustom'],
  })
  assert.equal(flags.theming, true)
  assert.equal(flags.themingCustom, false)
  assert.equal(flags.docs, true)
  assert.equal(flags.editor, false)
})

test('withDefaults rejects unknown capability keys', () => {
  assert.throws(
    () =>
      withDefaults({
        name: 'site',
        capabilities: {
          enable: ['unknown'],
        },
      }),
    /unknown capability key/i,
  )
})

test('withDefaults rejects overlapping capability keys', () => {
  assert.throws(
    () =>
      withDefaults({
        name: 'site',
        capabilities: {
          enable: ['docs'],
          disable: ['docs'],
        },
      }),
    /overlap/i,
  )
})
