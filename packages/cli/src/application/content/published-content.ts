import fs from 'node:fs/promises'
import path from 'node:path'
import { isStarterCollectionKey, resolveCapabilityFlags } from '@tidypress/config'
/** @typedef {import('../../types.js').SnapshotConfig} SnapshotConfig */

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
  const publishedMatch = frontmatter.match(/^published:\s*(.+)$/m)
  const scheduledMatch = frontmatter.match(/^scheduled:\s*(.+)$/m)
  const published =
    publishedMatch === null ? true : !/^(false|0|no)$/i.test(publishedMatch[1].trim())
  const scheduledValue = scheduledMatch?.[1].trim()
  const scheduled = scheduledValue ? new Date(scheduledValue) : undefined
  const hasValidSchedule = Boolean(scheduled && !Number.isNaN(scheduled.getTime()))

  return {
    title: titleMatch ? titleMatch[1].trim() : path.basename(filePath, path.extname(filePath)),
    description: descriptionMatch ? descriptionMatch[1].trim() : '',
    excerpt: body.slice(0, 180).replace(/\s+/g, ' '),
    body,
    published,
    scheduled: hasValidSchedule ? scheduled : undefined,
  }
}

/**
 * @param {string} rootDir
 */
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
 * Published markdown entries for static `llms.txt` export.
 *
 * @param {string} docsDir
 * @param {SnapshotConfig} [config]
 */
export async function createContentSnapshot(docsDir, config = undefined) {
  const capabilityFlags = resolveCapabilityFlags(
    /** @type {import('@tidypress/config').TidyPressConfig} */ (
      {
        name: 'snapshot',
        ...(config ?? {}),
      }
    ),
  )
  const configuredCollections = Object.entries(config?.collections ?? {
    docs: { enabled: true },
    writing: { enabled: true, kind: 'writing' },
    pages: { enabled: true, kind: 'page' },
  })
    .filter(([key, collection]) => {
      if (isStarterCollectionKey(key)) {
        return capabilityFlags[key] === true
      }
      return (collection as { enabled?: boolean })?.enabled !== false
    })
    .map(([key]) => [key, path.resolve(docsDir, `src/content/${key}`)])

  /** @type {{collection: string, filePath: string, title: string, description: string, excerpt: string, body: string}[]} */
  const items = []
  for (const [collection, root] of configuredCollections) {
    const files = await walkMarkdownFiles(root)
    for (const filePath of files) {
      const meta = await parseMarkdownMeta(filePath)
      if (!meta.published) {
        continue
      }
      if (meta.scheduled && meta.scheduled.getTime() > Date.now()) {
        continue
      }
      items.push({
        collection,
        filePath,
        ...meta,
      })
    }
  }
  return items
}
