import { getConfig } from '@/config/getConfig'

export async function GET() {
  const rawSite = (await import('@site-config')).default
  const site = getConfig(rawSite)
  const title = site.name
  const subtitle = site.description || 'Docs + writing'

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${escapeXml(
    title,
  )}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)" />
  <text x="80" y="260" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="72" fill="#f8fafc" font-weight="700">${escapeXml(
    title,
  )}</text>
  <text x="80" y="340" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="34" fill="#cbd5e1">${escapeXml(
    subtitle,
  )}</text>
</svg>`

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
