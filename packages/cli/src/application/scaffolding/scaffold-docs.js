import fs from 'node:fs/promises'
import path from 'node:path'
import { resolveStarterPreset } from '../../templates/starters.js'

function toQuotedValue(value) {
  return `'${value.replaceAll("'", "\\'")}'`
}

/**
 * @param {string} projectName
 * @param {import('../../templates/starters.js').StarterPreset} preset
 */
function buildConfigTemplate(projectName, preset) {
  const navItems = preset.nav.map(item => `    { label: ${toQuotedValue(item.label)}, href: ${toQuotedValue(item.href)} },`)
  const collectionLines = preset.collections.map(collection => {
    const parts = [`enabled: ${collection.enabled}`]
    if (collection.basePath) {
      parts.push(`basePath: ${toQuotedValue(collection.basePath)}`)
    }
    parts.push(`kind: ${toQuotedValue(collection.kind)}`)
    if (collection.label) {
      parts.push(`label: ${toQuotedValue(collection.label)}`)
    }
    return `    ${collection.key}: { ${parts.join(', ')} },`
  })

  return `export default {
  name: ${toQuotedValue(projectName)},
  description: ${toQuotedValue(preset.description)},
  nav: [
${navItems.join('\n')}
  ],
  // Text shown on the writing index page (optional).
  writing: {
    description: ${toQuotedValue(preset.writingDescription)},
  },
  collections: {
${collectionLines.join('\n')}
  },
  footer: [],
  siteUrl: 'https://example.com',
}
`
}

/**
 * @param {{ docsDir: string, projectName: string, starterPreset?: string }} options
 */
export async function scaffoldDocs({ docsDir, projectName, starterPreset }) {
  const preset = resolveStarterPreset(starterPreset)
  const collectionDirectories = preset.collections.map(collection =>
    path.resolve(docsDir, `src/content/${collection.key}`),
  )

  for (const directory of collectionDirectories) {
    await fs.mkdir(directory, { recursive: true })
  }

  const configPath = path.resolve(docsDir, 'docsmint.config.ts')
  const gitignorePath = path.resolve(docsDir, '.gitignore')

  await fs
    .writeFile(configPath, buildConfigTemplate(projectName, preset), { flag: 'wx' })
    .catch(() => {})
  for (const entry of preset.entries) {
    const entryPath = path.resolve(docsDir, `src/content/${entry.collection}/${entry.filePath}`)
    await fs.mkdir(path.dirname(entryPath), { recursive: true })
    await fs.writeFile(entryPath, entry.content, { flag: 'wx' }).catch(() => {})
  }
  for (const collection of preset.collections) {
    if (preset.entries.some(entry => entry.collection === collection.key)) {
      continue
    }
    await fs.writeFile(path.resolve(docsDir, `src/content/${collection.key}/.gitkeep`), '', { flag: 'wx' }).catch(
      () => {},
    )
  }

  let gitignoreContent = ''
  try {
    gitignoreContent = await fs.readFile(gitignorePath, 'utf8')
  } catch {
    // File does not exist yet.
  }
  if (!gitignoreContent.includes('.docsmint/')) {
    const suffix = gitignoreContent.length > 0 && !gitignoreContent.endsWith('\n') ? '\n' : ''
    await fs.writeFile(gitignorePath, `${gitignoreContent}${suffix}.docsmint/\n`, 'utf8')
  }
}
