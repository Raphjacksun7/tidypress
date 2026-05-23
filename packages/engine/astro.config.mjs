// @ts-check
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'astro/config'

const srcDir = fileURLToPath(new URL('./src', import.meta.url))
const siteConfigFile = fileURLToPath(new URL('./docsmint.config.ts', import.meta.url))
const projectRoot = process.env.DOCSMINT_PROJECT_ROOT ?? import.meta.dirname
import tailwindcss from '@tailwindcss/vite'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeExternalLinks from 'rehype-external-links'
import { resolveCodeThemePreset, withDefaults } from '@docsmint/config'
import { cleanInlineCodeIntegration } from './plugins/clean-inline-code.mjs'
import { docsmintPluginDev } from './plugins/docsmint-plugin-dev.mjs'
import { rehypeResolveDocLinks } from './plugins/rehype-resolve-doc-links.mjs'
import siteConfig from './docsmint.config.ts'

const normalizedSiteConfig = withDefaults(siteConfig)
const syntaxTheme = resolveCodeThemePreset(
  normalizedSiteConfig.theme?.code?.preset ?? 'claude',
).shikiTheme

/** @type {import('rehype-pretty-code').Options} */
const prettyCodeOptions = {
  theme: syntaxTheme,
  keepBackground: true,
  bypassInlineCode: true,
  // No defaultLang — inline backticks without a language tag pass through
  // as plain <code> elements, styled by CSS. Only fenced blocks with an
  // explicit language (```js, ```bash etc.) get syntax highlighting.
}

/** @param {string} collectionKey */
function getCollectionBasePath(collectionKey) {
  return normalizedSiteConfig.collections?.[collectionKey]?.basePath ?? `/${collectionKey}`
}

const rehypePlugins = /** @type {any} */ ([
  [rehypePrettyCode, prettyCodeOptions],
  [rehypeResolveDocLinks, { getCollectionBasePath }],
  [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
])

export default defineConfig({
  site: 'https://docs.example.com',
  cacheDir: './.astro/cache',
  image: {
    service: {
      entrypoint: 'astro/assets/services/noop',
    },
  },
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
    resolve: {
      alias: {
        '@': srcDir,
        '@site-config': siteConfigFile,
        '@project': projectRoot,
      },
    },
    define: {
      'import.meta.env.DOCSMINT_PROJECT_ROOT': JSON.stringify(projectRoot),
    },
    plugins: [
      tailwindcss(),
      ...(process.env.DOCSMINT_PROJECT_ROOT ? [docsmintPluginDev()] : []),
    ],
    build: {
      rollupOptions: {
        external: ['/pagefind/pagefind.js'],
      },
    },
  },
})
