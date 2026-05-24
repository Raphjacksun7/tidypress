import test from 'node:test'
import assert from 'node:assert/strict'

import { docsMintInitPresets, validateDocsMintYaml } from '../dist/index.js'

test('docsMintInitPresets lists moat presets', () => {
  const names = docsMintInitPresets.presets.map(preset => preset.name)
  assert.ok(names.includes('lab'))
  assert.ok(names.includes('blog'))
  assert.ok(names.includes('persona'))
  assert.equal(docsMintInitPresets.aliases.default, 'lab')
})

test('validateDocsMintYaml accepts python bridge config', () => {
  const result = validateDocsMintYaml({
    python: {
      convert: {
        input_path: 'notes.ipynb',
        watch: true,
      },
    },
  })
  assert.equal(result.ok, true)
})

test('validateDocsMintYaml rejects unknown root keys', () => {
  const result = validateDocsMintYaml({ site: { name: 'x' } })
  assert.equal(result.ok, false)
  assert.ok(result.issues.some(issue => issue.path === 'site'))
})
