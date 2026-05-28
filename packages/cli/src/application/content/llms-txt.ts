import { resolveProductionSiteUrl } from '@tidypress/config'
import fs from 'node:fs/promises'
import path from 'node:path'

import { createContentSnapshot } from './context-snapshot.js'

/** @typedef {import('@tidypress/config').TidyPressConfig} TidyPressConfig */

/**
 * @param {string} docsDir
 * @param {string} collectionKey
 * @param {string} filePath
 */
function entrySlugFromPath(docsDir, collectionKey, filePath) {
  const contentRoot = path.join(docsDir, 'src/content', collectionKey)
  const rel = path.relative(contentRoot, filePath).replaceAll(path.sep, '/')
  return rel.replace(/\.(md|mdx)$/i, '')
}

/**
 * @param {string} siteUrl
 * @param {string} basePath
 * @param {string} slug
 */
function publicEntryUrl(siteUrl, basePath, slug) {
  const normalizedBase = basePath.startsWith('/') ? basePath : `/${basePath}`
  const pathPart = slug ? `${normalizedBase}/${slug}` : normalizedBase
  if (!siteUrl) {
    return pathPart.replace(/\/{2,}/g, '/')
  }
  return `${siteUrl.replace(/\/$/, '')}${pathPart}`.replace(/([^:]\/)\/+/g, '$1')
}

/**
 * Writes `/llms.txt` for static hosts (llmstxt.org-style index of public pages).
 *
 * @param {{ docsDir: string, outputPath: string, config: TidyPressConfig }} options
 */
export async function writeLlmsTxt({ docsDir, outputPath, config }) {
  const snapshot = await createContentSnapshot(docsDir, {
    collections: config.collections,
    capabilities: config.capabilities,
  })

  const siteUrl = resolveProductionSiteUrl(config) ?? ''
  const siteName = config.name ?? 'Site'
  const siteDescription = config.description ?? ''

  /** @type {string[]} */
  const lines = [`# ${siteName}`, '']
  if (siteDescription) {
    lines.push(`> ${siteDescription}`, '')
  }
  if (siteUrl) {
    lines.push(`- [Home](${siteUrl}/)`, '')
  }

  /** @type {Map<string, typeof snapshot>} */
  const byCollection = new Map()
  for (const item of snapshot) {
    const bucket = byCollection.get(item.collection) ?? []
    bucket.push(item)
    byCollection.set(item.collection, bucket)
  }

  for (const [collectionKey, items] of byCollection) {
    const collectionConfig = config.collections?.[collectionKey]
    const label =
      typeof collectionConfig?.label === 'string' ? collectionConfig.label : collectionKey
    const basePath =
      typeof collectionConfig?.basePath === 'string'
        ? collectionConfig.basePath
        : `/${collectionKey}`

    lines.push(`## ${label}`, '')
    for (const item of items) {
      const slug = entrySlugFromPath(docsDir, collectionKey, item.filePath)
      const href = publicEntryUrl(siteUrl, basePath, slug)
      const detail = item.description || item.excerpt
      lines.push(detail ? `- [${item.title}](${href}): ${detail}` : `- [${item.title}](${href})`)
    }
    lines.push('')
  }

  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.writeFile(outputPath, `${lines.join('\n').trimEnd()}\n`, 'utf8')
}
