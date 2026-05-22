import test from 'node:test'
import assert from 'node:assert/strict'

import {
  assertReleaseVersionAlignment,
  parseReleaseTagVersion,
  readPythonProjectVersion,
} from '../src/application/release/version-alignment.js'

test('parseReleaseTagVersion returns semver value', () => {
  assert.equal(parseReleaseTagVersion('v1.2.3'), '1.2.3')
})

test('parseReleaseTagVersion rejects non-release tags', () => {
  assert.throws(
    () => parseReleaseTagVersion('1.2.3'),
    /Release tag must match v<major>\.<minor>\.<patch>/,
  )
})

test('readPythonProjectVersion reads version field from pyproject content', () => {
  const pyproject = `
[project]
name = "docsmint"
version = "0.1.14"
`
  assert.equal(readPythonProjectVersion(pyproject), '0.1.14')
})

test('assertReleaseVersionAlignment accepts aligned versions', () => {
  const result = assertReleaseVersionAlignment({
    tagName: 'v0.1.14',
    cliVersion: '0.1.14',
    pythonVersion: '0.1.14',
  })

  assert.equal(result.releaseVersion, '0.1.14')
})

test('assertReleaseVersionAlignment rejects mismatched versions', () => {
  assert.throws(
    () =>
      assertReleaseVersionAlignment({
        tagName: 'v0.1.14',
        cliVersion: '0.1.14',
        pythonVersion: '0.1.13',
      }),
    /Version mismatch/,
  )
})
