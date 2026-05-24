/**
 * @param {string} source Dev.to article URL or `username/slug` path.
 * @returns {Promise<{ title: string, description: string, body: string, date: string, tags: string[] }>}
 */
export async function fetchDevToArticle(source) {
  const path = parseDevToPath(source)
  const url = `https://dev.to/api/articles/by_path?path=${encodeURIComponent(path)}`
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Dev.to API returned ${response.status} for ${path}`)
  }

  const payload = await response.json()
  const article = Array.isArray(payload) ? payload[0] : payload
  if (!article?.body_markdown) {
    throw new Error(`Dev.to article not found or missing body for ${path}`)
  }

  const publishedAt = article.published_at ?? article.published_timestamp ?? new Date().toISOString()
  const date = new Date(publishedAt).toISOString().slice(0, 10)

  return {
    title: String(article.title ?? 'Imported article'),
    description: String(article.description ?? ''),
    body: String(article.body_markdown).trim(),
    date,
    tags: Array.isArray(article.tag_list) ? article.tag_list.map(String) : [],
  }
}

/**
 * @param {string} source
 * @returns {string}
 */
function parseDevToPath(source) {
  const trimmed = source.trim()
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    const parsed = new URL(trimmed)
    if (!parsed.hostname.endsWith('dev.to')) {
      throw new Error('Dev.to import expects a dev.to article URL.')
    }
    return parsed.pathname.replace(/\/$/, '') || '/'
  }
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}
