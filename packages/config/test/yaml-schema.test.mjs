import test from 'node:test'
import assert from 'node:assert/strict'

import { tidyPressInitPresets, validateTidyPressYaml } from '../dist/index.js'

test('tidyPressInitPresets lists moat presets', () => {
  const names = tidyPressInitPresets.presets.map(preset => preset.name)
  assert.ok(names.includes('lab'))
  assert.ok(names.includes('blog'))
  assert.ok(names.includes('persona'))
  assert.equal(tidyPressInitPresets.aliases.default, 'lab')
})

test('validateTidyPressYaml accepts python bridge config', () => {
  const result = validateTidyPressYaml({
    python: {
      convert: {
        input_path: 'notes.ipynb',
        watch: true,
      },
    },
  })
  assert.equal(result.ok, true)
})

test('validateTidyPressYaml rejects unknown root keys', () => {
  const result = validateTidyPressYaml({ site: { name: 'x' } })
  assert.equal(result.ok, false)
  assert.ok(result.issues.some(issue => issue.path === 'site'))
})
