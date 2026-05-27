import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const engineRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcRoot = path.join(engineRoot, 'src')

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)))
      continue
    }
    if (/\.(ts|astro)$/.test(entry.name)) {
      files.push(fullPath)
    }
  }
  return files
}

function rewriteImportPath(filePath, specifier) {
  if (!specifier.startsWith('.')) {
    return specifier
  }
  const resolved = path.normalize(path.join(path.dirname(filePath), specifier))
  const siteConfig = path.join(engineRoot, 'tidypress.config.ts')
  if (resolved === siteConfig) {
    return '@site-config'
  }
  if (!resolved.startsWith(srcRoot)) {
    return specifier
  }
  const rel = path.relative(srcRoot, resolved).replace(/\\/g, '/')
  return `@/${rel}`
}

function rewriteSpecifier(filePath, specifier) {
  return rewriteImportPath(filePath, specifier)
}

function rewriteFileContents(filePath, contents) {
  let next = contents.replace(
    /(from\s+['"])(\.[^'"]+)(['"])/g,
    (match, prefix, specifier, suffix) => {
      const alias = rewriteSpecifier(filePath, specifier)
      return alias === specifier ? match : `${prefix}${alias}${suffix}`
    },
  )
  next = next.replace(
    /(import\(\s*['"])(\.[^'"]+)(['"]\s*\))/g,
    (match, prefix, specifier, suffix) => {
      const alias = rewriteSpecifier(filePath, specifier)
      return alias === specifier ? match : `${prefix}${alias}${suffix}`
    },
  )
  return next
}

const files = await walk(srcRoot)
let changed = 0
for (const filePath of files) {
  const before = await fs.readFile(filePath, 'utf8')
  const after = rewriteFileContents(filePath, before)
  if (after !== before) {
    await fs.writeFile(filePath, after)
    changed += 1
  }
}
console.log(`Rewrote imports in ${changed} files under ${srcRoot}`)
