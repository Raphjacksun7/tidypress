import { defineConfig } from 'tidypress/config'

export default defineConfig({
  name: 'tidypress',
  description: 'A publishing framework for Git-native authorship.',
  branding: {
    icon: '/favicon.svg',
    favicon: '/favicon-white.svg',
  },
  nav: [
    { label: 'docs', href: '/docs' },
    { label: 'writing', href: '/writing' },
  ],
  footer: [
    { label: 'GitHub', href: 'https://github.com/Raphjacksun7/tidypress', icon: 'github' },
  ],
  pages: [],

  // Docs sidebar: one reader path first; advanced details stay at the end.
  docs: {
    sidebar: [
      {
        label: 'Start',
        items: ['why-tidypress', 'getting-started', 'examples'],
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
