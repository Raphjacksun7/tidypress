import { readdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(path)
    else if (entry.name.endsWith('.html')) yield path
  }
}

/** Strip the `style` attribute from an opening HTML tag string. */
function stripStyleAttr(tag) {
  return tag.replace(/\s*style="[^"]*"/g, '')
}

export function cleanInlineCodeIntegration() {
  return {
    name: 'clean-inline-code',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const distPath = dir.pathname
        let cleaned = 0
        for await (const file of walk(distPath)) {
          const html = await readFile(file, 'utf8')
          if (!html.includes('data-rehype-pretty-code-figure')) continue

          let fixed = html

          // ── Block code: keep theme backgrounds for syntax-highlighted blocks
          // (bash, js, md, etc.), but let plain text/tree blocks use TidyPress's
          // surface styling.
          fixed = fixed.replace(
            /(<pre\b[^>]*\bdata-language="[^"]*"[^>]*)>/g,
            (match, tag) => {
              const language = tag.match(/\bdata-language="([^"]*)"/)?.[1]
              return language === 'txt' || language === 'text' || language === 'plain'
                ? `${stripStyleAttr(tag)}>`
                : match
            },
          )

          // ── Inline code: <span data-rehype-pretty-code-figure=""><code style="...">…</code></span>
          fixed = fixed.replace(
            /<span data-rehype-pretty-code-figure="">\s*<code[^>]*style="[^"]*background-color:#24292e[^"]*"[^>]*>([\s\S]*?)<\/code>\s*<\/span>/g,
            (_match, inner) => {
              const text = inner.replace(/<[^>]+>/g, '')
              return `<code class="inline-code">${text}</code>`
            },
          )

          if (fixed !== html) {
            await writeFile(file, fixed)
            cleaned++
          }
        }
        console.log(`[clean-inline-code] Fixed ${cleaned} file(s)`)
      },
    },
  }
}
