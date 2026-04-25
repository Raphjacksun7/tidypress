import fs from 'node:fs/promises'
import path from 'node:path'

/**
 * @param {string} filePath
 */
async function parseMarkdownMeta(filePath) {
  const text = await fs.readFile(filePath, 'utf8')
  const trimmed = text.trim()
  const frontmatterMatch = trimmed.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  const body = frontmatterMatch ? frontmatterMatch[2].trim() : trimmed
  const frontmatter = frontmatterMatch ? frontmatterMatch[1] : ''

  const titleMatch = frontmatter.match(/^title:\s*(.+)$/m)
  const descriptionMatch = frontmatter.match(/^description:\s*(.+)$/m)

  return {
    title: titleMatch ? titleMatch[1].trim() : path.basename(filePath, path.extname(filePath)),
    description: descriptionMatch ? descriptionMatch[1].trim() : '',
    excerpt: body.slice(0, 180).replace(/\s+/g, ' '),
  }
}

async function walkMarkdownFiles(rootDir) {
  /** @type {string[]} */
  const files = []
  try {
    const entries = await fs.readdir(rootDir, { withFileTypes: true })
    for (const entry of entries) {
      const entryPath = path.join(rootDir, entry.name)
      if (entry.isDirectory()) {
        files.push(...(await walkMarkdownFiles(entryPath)))
      } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {
        files.push(entryPath)
      }
    }
  } catch {
    // Missing content directories are valid for empty projects.
  }
  return files
}

/**
 * @param {string} docsDir
 */
export async function createContentSnapshot(docsDir) {
  const docsRoot = path.resolve(docsDir, 'src/content/docs')
  const writingRoot = path.resolve(docsDir, 'src/content/writing')
  const pagesRoot = path.resolve(docsDir, 'src/content/pages')

  /** @type {{section: 'docs' | 'writing' | 'pages', filePath: string, title: string, description: string, excerpt: string}[]} */
  const items = []
  for (const [section, root] of /** @type {const} */ ([
    ['docs', docsRoot],
    ['writing', writingRoot],
    ['pages', pagesRoot],
  ])) {
    const files = await walkMarkdownFiles(root)
    for (const filePath of files) {
      const meta = await parseMarkdownMeta(filePath)
      items.push({
        section,
        filePath,
        ...meta,
      })
    }
  }
  return items
}

/**
 * @param {{ docsDir: string, outputPath: string }} options
 */
export async function writeContentSnapshot({ docsDir, outputPath }) {
  const snapshot = await createContentSnapshot(docsDir)
  const rel = target => path.relative(docsDir, target).replaceAll(path.sep, '/')

  const lines = ['# DocsMint Context Snapshot', '']
  for (const item of snapshot) {
    lines.push(`- [${item.section}] ${item.title}`)
    lines.push(`  - path: \`${rel(item.filePath)}\``)
    if (item.description) {
      lines.push(`  - description: ${item.description}`)
    }
    if (item.excerpt) {
      lines.push(`  - excerpt: ${item.excerpt}`)
    }
  }

  await fs.writeFile(outputPath, `${lines.join('\n')}\n`, 'utf8')
  return snapshot.length
}
