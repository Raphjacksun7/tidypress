import fs from 'node:fs/promises'
import path from 'node:path'

import { fetchDevToArticle } from '../application/import/devto.js'
import { formatWritingImportMarkdown } from '../application/import/format-writing-import.js'
import { TidyPressError } from '../errors/TidyPressError.js'

/**
 * Creates import-ready writing drafts from external provider references.
 */
export class ImportService {
  /**
   * @param {{ configLoader: import('./ConfigLoader.js').ConfigLoader }} dependencies
   */
  constructor({ configLoader }) {
    this.configLoader = configLoader
  }

  /**
   * @param {{ projectRoot: string, provider: 'medium' | 'devto' | 'substack' | 'ghost', source: string, scheduled?: string }} request
   * @returns {Promise<{ outputPath: string, imported: boolean }>}
   */
  async run({ projectRoot, provider, source, scheduled }) {
    const scheduledAt = this.#parseScheduled(scheduled)
    const docsDir = await this.configLoader.resolveDocsDirectory({ projectRoot })
    const writingDir = path.join(docsDir, 'src', 'content', 'writing', 'imported')
    await fs.mkdir(writingDir, { recursive: true })

    const date = new Date()
    const dateKey = date.toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)
    const slug = this.#slugify(`${provider}-${source}`) || provider
    const filePath = path.join(writingDir, `${slug}-${dateKey}.md`)

    if (provider === 'devto') {
      try {
        const article = await fetchDevToArticle(source)
        const body = formatWritingImportMarkdown({
          title: article.title,
          description: article.description,
          body: article.body,
          date: article.date,
          tags: article.tags,
          source,
          scheduled: scheduledAt,
        })
        await fs.writeFile(filePath, body, { flag: 'wx' })
        return { outputPath: filePath, imported: true }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        throw new TidyPressError(
          `Dev.to import failed: ${message}`,
          'IMPORT_FAILED',
          'Use a public dev.to article URL or username/slug path.',
          { exitCode: 2 },
        )
      }
    }

    const dateString = date.toISOString().slice(0, 10)
    const body = formatWritingImportMarkdown({
      title: `Imported ${provider} draft`,
      description: `Imported from ${source}`,
      body: `Source: ${source}\n\nReview and replace this scaffold body with the imported article content.`,
      date: dateString,
      source,
      scheduled: scheduledAt,
    })

    await fs.writeFile(filePath, body, { flag: 'wx' })
    return { outputPath: filePath, imported: false }
  }

  /**
   * @param {string | undefined} scheduled
   * @returns {Date | undefined}
   */
  #parseScheduled(scheduled) {
    if (!scheduled) {
      return undefined
    }
    const parsed = new Date(scheduled)
    if (Number.isNaN(parsed.getTime())) {
      throw new TidyPressError(
        `Invalid scheduled value "${scheduled}".`,
        'INVALID_IMPORT_OPTION',
        'Use an ISO datetime like 2026-05-20T09:00:00Z',
        { exitCode: 2 },
      )
    }
    return parsed
  }

  /**
   * @param {string} value
   * @returns {string}
   */
  #slugify(value) {
    return value
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 64)
  }
}
