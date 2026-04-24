import { readdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(path)
    else if (entry.name.endsWith('.html')) yield path
  }
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
          if (!html.includes('background-color:#24292e')) continue
          const fixed = html.replace(
            /<span data-rehype-pretty-code-figure="">\s*<code[^>]*style="[^"]*background-color:#24292e[^"]*"[^>]*>([\s\S]*?)<\/code>\s*<\/span>/g,
            (_match, inner) => {
              const text = inner.replace(/<[^>]+>/g, '')
              return `<code class="inline-code">${text}</code>`
            }
          )
          await writeFile(file, fixed)
          cleaned++
        }
        console.log(`[clean-inline-code] Fixed ${cleaned} file(s)`)
      }
    }
  }
}
