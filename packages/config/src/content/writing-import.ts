import { formatFrontmatterBlock, type FrontmatterFieldDefinition } from './frontmatter-format.js'

export interface DocsMintWritingImportArticle {
  title: string
  description?: string
  date: string
  published?: boolean
  tags?: string[]
  scheduled?: Date
  body: string
  source: string
}

export const docsMintWritingImportFrontmatterFields = [
  { key: 'title', format: 'scalar' },
  { key: 'description', format: 'scalar', optional: true },
  { key: 'date', format: 'scalar' },
  { key: 'published', format: 'scalar', defaultValue: true },
  { key: 'tags', format: 'string-array', optional: true },
  { key: 'scheduled', format: 'iso-date', optional: true },
] as const satisfies readonly FrontmatterFieldDefinition[]

export function formatWritingImportMarkdown(article: DocsMintWritingImportArticle): string {
  const frontmatter = formatFrontmatterBlock(docsMintWritingImportFrontmatterFields, {
    title: article.title,
    description: article.description,
    date: article.date,
    published: article.published,
    tags: article.tags,
    scheduled: article.scheduled,
  })
  return `---\n${frontmatter}\n---\n\n${article.body}\n\n<!-- Imported from ${article.source} -->\n`
}
