import fs from 'node:fs/promises'
import path from 'node:path'

import { DocsMintError } from '../errors/DocsMintError.js'

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
   * @returns {Promise<{ outputPath: string }>}
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
    const dateString = date.toISOString().slice(0, 10)
    const title = `Imported ${provider} draft`
    const description = `Imported from ${source}`

    const scheduledLine = scheduledAt ? `scheduled: ${scheduledAt.toISOString()}\n` : ''
    const body = `---
title: ${title}
description: ${description}
date: ${dateString}
published: true
${scheduledLine}---

Source: ${source}

Review and replace this scaffold body with the imported article content.
`

    await fs.writeFile(filePath, body, { flag: 'wx' })
    return { outputPath: filePath }
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
      throw new DocsMintError(
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
