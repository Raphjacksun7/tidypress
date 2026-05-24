import { defineConfig } from 'docsmint/config'

export default defineConfig({
  name: 'docsmint',
  description: 'Minimal markdown site for fast writing and project showcase.',
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

  // Docs sidebar: one reader path first; advanced details stay at the end.
  docs: {
    sidebar: [
      {
        label: 'Start',
        items: ['why-docsmint', 'getting-started', 'examples'],
      },
      {
        label: 'Write',
        items: ['writing-content', 'components'],
      },
      {
        label: 'Configure',
        items: ['configuration', 'site-layout', 'display-options', 'theme-typography'],
      },
      {
        label: 'Ship',
        items: ['deploying', 'python'],
      },
      {
        label: 'Reference',
        items: ['reference', 'advanced-configuration', 'extensibility', 'architecture'],
      },
    ],
  },

})
