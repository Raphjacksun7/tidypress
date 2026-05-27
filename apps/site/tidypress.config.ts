import { defineConfig } from 'tidypress/config'

/** https://github.com/Raphjacksun7/tidypress */
const GITHUB_REPO = 'https://github.com/Raphjacksun7/tidypress'
const GITHUB_FEATURE = `${GITHUB_REPO}/issues/new?template=feature_request.yml`

export default defineConfig({
  name: 'tidypress',
  description: 'A publishing framework for Git-native authorship.',
  siteUrl: 'https://tidypress.pages.dev',
  branding: {
    icon: '/favicon.svg',
    favicon: '/favicon-white.svg',
  },
  nav: [
    { label: 'docs', href: '/docs' },
    { label: 'writing', href: '/writing' },
  ],
  repository: {
    url: GITHUB_REPO,
    branch: 'main',
    editPath: 'apps/site/src/content',
  },
  footer: {
    // Site name is already in the product credit — avoid "© 2026 tidypress, Made with tidypress".
    copyright: '© {year}',
    main: {
      start: [
        { label: 'Improve these docs', href: `${GITHUB_REPO}/blob/main/CONTRIBUTING.md` },
        { label: 'Share a feature idea', href: GITHUB_FEATURE },
      ],
    },
    links: [{ label: 'GitHub', href: GITHUB_REPO, icon: 'github' }],
  },
  pages: [],

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
