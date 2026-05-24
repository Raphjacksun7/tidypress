import fs from 'node:fs/promises'
import path from 'node:path'
import { resolveStarterPreset } from '../../templates/starters.js'
import { buildStarterConfig, formatConfigModule } from './starter-config.js'

const ASTRO_CONFIG_TEMPLATE = `import { defineConfig } from 'astro/config'
import docsmint from '@docsmint/astro'

export default defineConfig({
  integrations: [docsmint()],
})
`

/**
 * @param {{ docsDir: string, projectName: string, starterPreset?: string, withAstro?: boolean }} options
 */
export async function scaffoldDocs({ docsDir, projectName, starterPreset, withAstro = false }) {
  const preset = resolveStarterPreset(starterPreset)
  const collectionDirectories = preset.collections.map(collection =>
    path.resolve(docsDir, `src/content/${collection.key}`),
  )

  for (const directory of collectionDirectories) {
    await fs.mkdir(directory, { recursive: true })
  }
  await fs.mkdir(path.resolve(docsDir, 'public/images'), { recursive: true })
  await fs
    .writeFile(path.resolve(docsDir, 'public/images/.gitkeep'), '', { flag: 'wx' })
    .catch(() => {})

  const configPath = path.resolve(docsDir, 'docsmint.config.ts')
  const gitignorePath = path.resolve(docsDir, '.gitignore')

  await fs
    .writeFile(
      configPath,
      formatConfigModule(buildStarterConfig(projectName, preset)),
      { flag: 'wx' },
    )
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
  const gitignoreLines = ['build/', '.docsmint/']
  let updatedGitignore = gitignoreContent
  for (const line of gitignoreLines) {
    if (!updatedGitignore.includes(line)) {
      const suffix = updatedGitignore.length > 0 && !updatedGitignore.endsWith('\n') ? '\n' : ''
      updatedGitignore = `${updatedGitignore}${suffix}${line}\n`
    }
  }
  if (updatedGitignore !== gitignoreContent) {
    await fs.writeFile(gitignorePath, updatedGitignore, 'utf8')
  }

  if (withAstro) {
    const astroConfigPath = path.resolve(docsDir, 'astro.config.mjs')
    await fs.writeFile(astroConfigPath, ASTRO_CONFIG_TEMPLATE, { flag: 'wx' }).catch(() => {})
  }
}
