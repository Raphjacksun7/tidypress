import { defineConfig } from 'docsmint/config'

export default defineConfig({
  name: 'docsmint',
  description: 'Minimal markdown docs and writing.',
  branding: {
    icon: '/favicon.svg',
    favicon: '/favicon-white.svg',
  },
  nav: [
    { label: 'docs', href: '/docs' },
    { label: 'writing', href: '/writing' },
  ],
  footer: [
    { label: 'GitHub', href: 'https://github.com/Raphjacksun7/docsmint', icon: 'github' },
  ],
  pages: [],

  // Docs sidebar: explicit section groups
  docs: {
    sidebar: [
      {
        label: 'Getting started',
        items: ['why-docsmint', 'getting-started', 'examples', 'architecture'],
      },
      {
        label: 'Authoring',
        items: ['writing-content', 'components', 'reference'],
      },
      {
        label: 'Configuration',
        items: ['configuration', 'sidebar-navigation', 'display-options', 'theme-typography', 'i18n', 'versions', 'capabilities', 'analytics'],
      },
      {
        label: 'Tooling',
        items: ['context-export', 'python', 'extensibility'],
      },
      {
        label: 'Deployment',
        items: ['deploying'],
      },
      {
        label: 'Manual demo',
        items: ['manual/intro', 'manual/install', 'manual/configure', 'manual/build'],
      },
    ],
  },

})
