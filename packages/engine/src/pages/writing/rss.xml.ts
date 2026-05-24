import { getConfig } from '@/config/getConfig'
import { getCollectionBasePath, getCollectionEntryPath } from '@/utils/collections'
import { loadPublishedCollectionEntries } from '@/utils/collection-entries'
import rawSiteConfig from '@site-config'

export const prerender = true

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

export async function GET() {
  const site = getConfig(rawSiteConfig)
  const baseUrl = site.siteUrl?.replace(/\/$/, '') ?? ''
  const writingPath = getCollectionBasePath(site, 'writing')
  const posts = (await loadPublishedCollectionEntries<{ date?: string | Date; title?: string; description?: string }>(
    'writing',
  )).sort(
    (a, b) =>
      new Date(b.data.date ?? 0).getTime() - new Date(a.data.date ?? 0).getTime(),
  )

  const items = posts
    .map(post => {
      const data = post.data
      const path = getCollectionEntryPath(site, 'writing', post.id)
      const link = baseUrl ? `${baseUrl}${path}` : path
      const pubDate = new Date(data.date ?? 0).toUTCString()
      return `<item>
  <title>${escapeXml(data.title ?? post.id)}</title>
  <link>${escapeXml(link)}</link>
  <guid isPermaLink="true">${escapeXml(link)}</guid>
  <pubDate>${pubDate}</pubDate>
  ${data.description ? `<description>${escapeXml(data.description)}</description>` : ''}
</item>`
    })
    .join('\n')

  const feedLink = baseUrl ? `${baseUrl}${writingPath}/rss.xml` : `${writingPath}/rss.xml`
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(site.name)}</title>
    <link>${escapeXml(baseUrl || '/')}</link>
    <description>${escapeXml(site.description ?? site.name)}</description>
    <atom:link href="${escapeXml(feedLink)}" rel="self" type="application/rss+xml" xmlns:atom="http://www.w3.org/2005/Atom" />
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  })
}
