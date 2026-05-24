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
    tagName: 'v1.0.4',
    cliVersion: '1.0.4',
    configVersion: '1.0.4',
    engineVersion: '1.0.4',
    pythonVersion: '1.0.4',
  })

  assert.equal(result.releaseVersion, '1.0.4')
  assert.equal(result.configVersion, '1.0.4')
  assert.equal(result.engineVersion, '1.0.4')
})

test('assertReleaseVersionAlignment rejects mismatched cli version', () => {
  assert.throws(
    () =>
      assertReleaseVersionAlignment({
        tagName: 'v1.0.4',
        cliVersion: '1.0.3',
        configVersion: '1.0.4',
        engineVersion: '1.0.4',
        pythonVersion: '1.0.4',
      }),
    /Version mismatch/,
  )
})

test('assertReleaseVersionAlignment rejects mismatched config version', () => {
  assert.throws(
    () =>
      assertReleaseVersionAlignment({
        tagName: 'v1.0.4',
        cliVersion: '1.0.4',
        configVersion: '0.1.0',
        engineVersion: '1.0.4',
        pythonVersion: '1.0.4',
      }),
    /config=0\.1\.0/,
  )
})

test('assertReleaseVersionAlignment rejects mismatched engine version', () => {
  assert.throws(
    () =>
      assertReleaseVersionAlignment({
        tagName: 'v1.0.4',
        cliVersion: '1.0.4',
        configVersion: '1.0.4',
        engineVersion: '0.1.0',
        pythonVersion: '1.0.4',
      }),
    /engine=0\.1\.0/,
  )
})

test('assertReleaseVersionAlignment rejects mismatched python version', () => {
  assert.throws(
    () =>
      assertReleaseVersionAlignment({
        tagName: 'v1.0.4',
        cliVersion: '1.0.4',
        configVersion: '1.0.4',
        engineVersion: '1.0.4',
        pythonVersion: '1.0.3',
      }),
    /python=1\.0\.3/,
  )
})

test('assertReleaseVersionAlignment reports all mismatches at once', () => {
  assert.throws(
    () =>
      assertReleaseVersionAlignment({
        tagName: 'v1.0.4',
        cliVersion: '1.0.3',
        configVersion: '0.1.0',
        engineVersion: '0.1.0',
        pythonVersion: '1.0.3',
      }),
    /cli=1\.0\.3.*config=0\.1\.0/s,
  )
})
