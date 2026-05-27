import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

/** Inline only reasonably small SVGs; large assets stay as URL/mask. */
const MAX_INLINE_SVG_BYTES = 12_000

export type LoadedProjectIcon =
  | { mode: 'inline'; markup: string }
  | { mode: 'mask'; url: string }
  | { mode: 'raster'; url: string }

export function resolveProjectRoot(): string {
  const fromProcess = process.env.TIDYPRESS_PROJECT_ROOT
  if (fromProcess) {
    return fromProcess
  }
  const fromImport = import.meta.env.TIDYPRESS_PROJECT_ROOT
  if (typeof fromImport === 'string' && fromImport.length > 0) {
    return fromImport
  }
  return process.cwd()
}

export function sanitizeInlineSvg(raw: string): string {
  return raw
    .replace(/<\?xml[\s\S]*?\?>/gi, '')
    .replace(/<!DOCTYPE[\s\S]*?>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(
      /<svg([^>]*)>/i,
      '<svg$1 focusable="false" aria-hidden="true" preserveAspectRatio="xMidYMid meet">',
    )
}

export async function loadProjectIcon(src: string): Promise<LoadedProjectIcon> {
  const isSvg = /\.svg(?:$|[?#])/i.test(src)
  if (!isSvg) {
    return { mode: 'raster', url: src }
  }

  const assetPath = src.split('?')[0]?.split('#')[0] ?? src
  if (!assetPath.startsWith('/')) {
    return { mode: 'mask', url: src }
  }

  const root = resolveProjectRoot()
  const candidates = [
    join(root, 'public', assetPath.slice(1)),
    join(root, assetPath.slice(1)),
  ]

  for (const filePath of candidates) {
    if (!existsSync(filePath)) {
      continue
    }
    const raw = await readFile(filePath, 'utf8')
    if (Buffer.byteLength(raw, 'utf8') > MAX_INLINE_SVG_BYTES) {
      return { mode: 'mask', url: src }
    }
    return { mode: 'inline', markup: sanitizeInlineSvg(raw) }
  }

  return { mode: 'mask', url: src }
}
