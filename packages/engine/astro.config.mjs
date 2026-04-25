// @ts-check
import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeExternalLinks from 'rehype-external-links'
import { cleanInlineCodeIntegration } from './plugins/clean-inline-code.mjs'

/** @type {import('rehype-pretty-code').Options} */
const prettyCodeOptions = {
  theme: 'github-dark',
  keepBackground: true,
  bypassInlineCode: true,
  // No defaultLang — inline backticks without a language tag pass through
  // as plain <code> elements, styled by CSS. Only fenced blocks with an
  // explicit language (```js, ```bash etc.) get syntax highlighting.
}

const rehypePlugins = /** @type {any} */ ([
  [rehypePrettyCode, prettyCodeOptions],
  [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
])

export default defineConfig({
  site: 'https://docs.example.com',
  integrations: [
    mdx({ rehypePlugins }),
    sitemap(),
    cleanInlineCodeIntegration(),
  ],
  markdown: {
    rehypePlugins,
    syntaxHighlight: false,
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        external: ['/pagefind/pagefind.js'],
      },
    },
  },
})
