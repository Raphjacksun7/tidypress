// Example fixture URL — replace before deploy (see examples/README.md).
export default {
  name: 'i18n-versioned-example',
  description: 'TidyPress i18n and versioning example.',
  nav: [
    { label: 'docs', href: '/docs' },
    { label: 'writing', href: '/writing' },
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr'],
    strings: {
      fr: {
        docsTitle: 'Documentation',
        writingTitle: 'Articles',
        onThisPageLabel: 'Sur cette page',
      },
    },
  },
  versions: [
    { label: 'v2 (latest)', path: '/docs' },
    { label: 'v1', path: '/docs/v1' },
  ],
  docs: {
    sidebar: [
      { label: 'Latest', items: ['getting-started'] },
      { label: 'Archive', items: ['v1/getting-started'] },
    ],
  },
  siteUrl: 'https://example.com',
}
