# TidyPress config reference (agent)

## Collections

```ts
collections: {
  docs: { enabled: true, basePath: '/docs', label: 'docs' },
  writing: { enabled: true, basePath: '/writing', kind: 'writing', label: 'writing' },
  pages: { enabled: true, kind: 'page', label: 'pages' },
  projects: { enabled: true, basePath: '/projects', kind: 'projects', label: 'projects' },
  playbooks: { enabled: true, basePath: '/playbooks', label: 'playbooks' }, // custom
}
```

Custom collection keys (non-starter) need `enabled: true` and usually a `basePath`.

## Capabilities (common flags)

Starter keys include: `docs`, `pages`, `writing`, `projects`, `search`, `rss`, `archive`, `tags`, `readingTime`, `i18n`, `versioning`, …

Disable via preset or:

```ts
capabilities: { disable: ['docs', 'pages'] }
```

## Home

```ts
home: {
  order: ['writing', 'projects'],
  writing: { limit: 5 },
  projects: { limit: 6 },
}
```

## Hero (persona)

```ts
hero: {
  enabled: true,
  role: '…',
  lead: '…',
  image: '/images/avatar.jpg',
  links: [{ label: 'GitHub', href: 'https://github.com/you', external: true }],
}
```

## i18n / versions

- i18n: locale folders + config `i18n` block (see site docs `/docs/i18n`).
- Docs versions: `tidypress add-version <slug> --set-latest`.

## Deploy targets (examples)

`tidypress deploy cloudflare` · `github-pages` · `vercel` · `netlify` · `artifact-only`

Use `tidypress deploy --help` for flags (`--with-ci`, output dir).

## Context snapshot

Every `tidypress build` writes `build/llms.txt`: public URLs plus full markdown bodies for published entries (respects `published` / `scheduled` frontmatter).
