import fs from 'node:fs/promises'
import path from 'node:path'

const defaultConfigTemplate = projectName => `import { defineConfig } from 'docsmint/config'

export default defineConfig({
  name: '${projectName}',
  description: 'Minimal markdown docs and writing.',
  nav: [
    { label: 'docs', href: '/docs' },
    { label: 'writing', href: '/writing' },
  ],
  footer: [],
  extensions: {
    customPages: [],
  },
})
`

const defaultDocsPage = `---
title: Getting started
description: Welcome to DocsMint.
order: 1
---

Welcome to DocsMint. Edit this page at \`docs/src/content/docs/getting-started.md\`.
`

const defaultWritingPage = `---
title: Hello
description: First writing entry.
date: 2026-01-01
---

This is your first writing post.
`

/**
 * @param {{ docsDir: string, projectName: string }} options
 */
export async function scaffoldDocs({ docsDir, projectName }) {
  await fs.mkdir(path.resolve(docsDir, 'src/content/docs'), { recursive: true })
  await fs.mkdir(path.resolve(docsDir, 'src/content/writing'), { recursive: true })
  await fs.mkdir(path.resolve(docsDir, 'src/content/extensions'), { recursive: true })

  const configPath = path.resolve(docsDir, 'docsmint.config.ts')
  const docsPath = path.resolve(docsDir, 'src/content/docs/getting-started.md')
  const writingPath = path.resolve(docsDir, 'src/content/writing/hello.md')
  const extensionsGitkeepPath = path.resolve(docsDir, 'src/content/extensions/.gitkeep')
  const gitignorePath = path.resolve(docsDir, '.gitignore')

  await fs.writeFile(configPath, defaultConfigTemplate(projectName), { flag: 'wx' }).catch(() => {})
  await fs.writeFile(docsPath, defaultDocsPage, { flag: 'wx' }).catch(() => {})
  await fs.writeFile(writingPath, defaultWritingPage, { flag: 'wx' }).catch(() => {})
  await fs.writeFile(extensionsGitkeepPath, '', { flag: 'wx' }).catch(() => {})

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
