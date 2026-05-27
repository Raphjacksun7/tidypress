/**
 * TidyPress Astro integration — used by the CLI and @tidypress/astro.
 * @returns {import('astro').AstroIntegration}
 */
export default function tidypressIntegration() {
  return {
    name: 'tidypress',
    hooks: {
      'astro:config:setup'({ updateConfig }) {
        const projectRoot = process.env.TIDYPRESS_PROJECT_ROOT
        const manifestPath = process.env.TIDYPRESS_MANIFEST_PATH
        if (!projectRoot) {
          return
        }

        const aliases = {
          '@project': projectRoot,
          '@site-config': `${projectRoot}/tidypress.config.ts`,
        }

        if (manifestPath) {
          aliases['@/generated/tidypress-plugins.mjs'] = manifestPath
        }

        updateConfig({
          vite: {
            resolve: {
              alias: aliases,
            },
          },
        })
      },
    },
  }
}
