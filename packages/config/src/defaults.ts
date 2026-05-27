import type { TidyPressConfig } from './schema/index.js'

export const defaultConfig: Partial<TidyPressConfig> = {
  description: '',
  analytics: { type: 'none' },
  experimental: {
    editor: false,
    export: false,
    ai: false,
  },
  capabilities: {},
  writing: {
    description: 'Engineering notes, architectural decisions, and observations.',
  },
  typography: {
    scale: 'medium',
  },
  theme: {
    mode: 'guardrailed',
    preset: 'baseline',
    code: {
      preset: 'claude',
    },
    tokens: {
      light: {
        bg: '#fbfbfb',
        fg: '#000000',
        muted: '#71717a',
        border: '#e5e5e5',
        surface: '#f4f4f4',
        codeBg: '#f4f4f4',
        codeFg: '#000000',
      },
      dark: {
        bg: '#0a0a0a',
        fg: '#fafafa',
        muted: '#a1a1aa',
        border: '#27272a',
        surface: '#18181b',
        codeBg: '#18181b',
        codeFg: '#e4e4e7',
      },
    },
  },
  pages: [],
  nav: [
    { label: 'docs', href: '/docs' },
    { label: 'writing', href: '/writing' },
  ],
  footer: [],
  repository: {
    branch: 'main',
  },
  search: {
    exclude: [],
  },
  collections: {
    docs: {
      enabled: true,
      basePath: '/docs',
    },
    writing: {
      kind: 'writing',
      enabled: true,
      basePath: '/writing',
    },
    pages: {
      kind: 'page',
      enabled: true,
    },
  },
  sections: {
    docs: {
      enabled: true,
      basePath: '/docs',
    },
    writing: {
      enabled: true,
      basePath: '/writing',
    },
  },
  dateLocale: 'en-US',
  dateFormat: { year: 'numeric', month: 'short', day: 'numeric' },
  navPolicy: {
    mode: 'strict',
    maxVisibleDesktop: 3,
    maxVisibleMobile: 2,
  },
}
