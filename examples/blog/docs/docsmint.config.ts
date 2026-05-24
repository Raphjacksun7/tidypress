export default {
  name: 'blog',
  description: 'Minimal markdown site for fast writing and project showcase.',
  nav: [{ label: 'writing', href: '/writing' }],
  home: {
    order: ['writing'],
    previewLimit: 5,
  },
  capabilities: {
    disable: ['docs', 'pages'],
  },
  writing: {
    description: 'Posts and notes.',
  },
  collections: {
    docs: { enabled: false, basePath: '/docs', label: 'docs' },
    writing: { enabled: true, kind: 'writing', basePath: '/writing', label: 'writing' },
    pages: { enabled: false, kind: 'page' },
  },
  footer: [],
  siteUrl: 'https://example.com',
}
