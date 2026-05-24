#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const MIN_TESTS = Number.parseInt(process.env.DOCSMINT_MIN_TESTS ?? '50', 10)

/**
 * @param {string} directory
 * @returns {Promise<string[]>}
 */
async function listFiles(directory) {
  /** @type {string[]} */
  const files = []
  const entries = await fs.readdir(directory, { withFileTypes: true })
  for (const entry of entries) {
    const resolved = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await listFiles(resolved)))
      continue
    }
    files.push(resolved)
  }
  return files
}

/**
 * @param {string} filePath
 * @param {RegExp} pattern
 * @returns {Promise<number>}
 */
async function countMatches(filePath, pattern) {
  const source = await fs.readFile(filePath, 'utf8')
  const matches = source.match(pattern)
  return matches ? matches.length : 0
}

const nodeTestRoot = path.join(ROOT, 'packages')
const pythonTestRoot = path.join(ROOT, 'wrappers', 'python', 'tests')

const allPackageFiles = await listFiles(nodeTestRoot)
const nodeTestFiles = allPackageFiles.filter(filePath => /\.test\.(js|mjs|ts)$/.test(filePath))

const pythonTestFiles = await listFiles(pythonTestRoot)
const pythonFiles = pythonTestFiles.filter(filePath => filePath.endsWith('.py'))

let nodeTests = 0
for (const filePath of nodeTestFiles) {
  nodeTests += await countMatches(filePath, /\btest\(/g)
}

let pythonTests = 0
for (const filePath of pythonFiles) {
  pythonTests += await countMatches(filePath, /^def test_/gm)
}

const totalTests = nodeTests + pythonTests

console.log(`Node tests: ${nodeTests}`)
console.log(`Python tests: ${pythonTests}`)
console.log(`Total tests: ${totalTests}`)
console.log(`Minimum required: ${MIN_TESTS}`)

if (totalTests < MIN_TESTS) {
  console.error(`Test count gate failed: expected at least ${MIN_TESTS} tests.`)
  process.exit(1)
}

console.log('Test count gate passed.')
