/**
 * DocsMint Astro integration — used by the CLI and @docsmint/astro.
 * @returns {import('astro').AstroIntegration}
 */
export default function docsmintIntegration() {
  return {
    name: 'docsmint',
    hooks: {
      'astro:config:setup'({ updateConfig }) {
        const projectRoot = process.env.DOCSMINT_PROJECT_ROOT
        const manifestPath = process.env.DOCSMINT_MANIFEST_PATH
        if (!projectRoot) {
          return
        }

        const aliases = {
          '@project': projectRoot,
          '@site-config': `${projectRoot}/docsmint.config.ts`,
        }

        if (manifestPath) {
          aliases['@/generated/docsmint-plugins.mjs'] = manifestPath
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
