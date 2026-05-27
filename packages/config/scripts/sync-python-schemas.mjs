#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourceDir = path.join(root, 'src', 'schemas')
const targetDir = path.join(root, '..', '..', 'wrappers', 'python', 'tidypress', 'schemas')

fs.mkdirSync(targetDir, { recursive: true })
for (const fileName of fs.readdirSync(sourceDir)) {
  if (!fileName.endsWith('.json')) {
    continue
  }
  fs.copyFileSync(path.join(sourceDir, fileName), path.join(targetDir, fileName))
}
console.log(`Synced schemas to ${targetDir}`)
