// @ts-check
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { defineConfig, logHandlers } from 'astro/config'

const require = createRequire(import.meta.url)
const srcDir = fileURLToPath(new URL('./src', import.meta.url))
const projectRoot = process.env.TIDYPRESS_PROJECT_ROOT ?? import.meta.dirname
const siteConfigFile = process.env.TIDYPRESS_PROJECT_ROOT
  ? path.resolve(projectRoot, 'tidypress.config.ts')
  : fileURLToPath(new URL('./tidypress.config.ts', import.meta.url))

const loadConfig = require('jiti')(import.meta.url, { interopDefault: true })
const siteConfig = loadConfig(siteConfigFile)

import tailwindcss from '@tailwindcss/vite'
import mdx from '@astrojs/mdx'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeExternalLinks from 'rehype-external-links'
import { resolveCodeThemePreset, resolveProductionSiteUrl, withDefaults } from '@tidypress/config'
import { cleanInlineCodeIntegration } from './plugins/clean-inline-code.mjs'
import { tidypressPluginDev } from './plugins/tidypress-plugin-dev.mjs'
import { rehypeResolveDocLinks } from './plugins/rehype-resolve-doc-links.mjs'
import tidypressIntegration from './integration/tidypress.mjs'

const normalizedSiteConfig = withDefaults(siteConfig)
const syntaxTheme = resolveCodeThemePreset(
  normalizedSiteConfig.theme?.code?.preset ?? 'claude',
).shikiTheme

/** @type {import('rehype-pretty-code').Options} */
const prettyCodeOptions = {
  theme: /** @type {any} */ (syntaxTheme),
  keepBackground: true,
  bypassInlineCode: true,
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

const useJsonLogs =
  process.env.CI === 'true' || process.env.TIDYPRESS_JSON_LOGS === '1'

const productionSite = resolveProductionSiteUrl(normalizedSiteConfig)

export default defineConfig({
  ...(productionSite ? { site: productionSite } : {}),
  build: {
    assets: 'assets',
  },
  experimental: {
    logger: logHandlers.json({ pretty: !useJsonLogs, level: 'info' }),
  },
  image: {
    service: {
      entrypoint: 'astro/assets/services/noop',
    },
  },
  integrations: [
    tidypressIntegration(),
    mdx({ rehypePlugins }),
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
      'import.meta.env.TIDYPRESS_PROJECT_ROOT': JSON.stringify(projectRoot),
    },
    plugins: [
      tailwindcss(),
      ...(process.env.TIDYPRESS_PROJECT_ROOT ? [tidypressPluginDev()] : []),
    ],
    build: {
      rollupOptions: {
        external: ['/pagefind/pagefind.js'],
      },
    },
  },
})
