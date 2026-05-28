# TidyPress config reference

Agent-oriented compact reference.

## Publish root vs docs collection

- **Publish root:** folder with `tidypress.config.ts`. `init` defaults to `site/`.
- **`docs` collection:** `src/content/docs/` → routes under `/docs/…` (first-class; disabled in `lab` / `body-of-work` presets by default).
- **Discovery:** cwd → `site/` → sibling folders. Set `TIDYPRESS_PUBLISH_ROOT` when ambiguous.

## Collections

```ts
collections: {
  writing: { enabled: true, basePath: '/writing', kind: 'writing', label: 'writing' },
  docs: { enabled: false, basePath: '/docs', label: 'docs' },
  pages: { enabled: true, kind: 'page', label: 'pages' },
  projects: { enabled: true, basePath: '/projects', kind: 'projects', label: 'projects' },
  playbooks: { enabled: true, basePath: '/playbooks', label: 'playbooks' }, // custom
}
```

Custom collection keys need `enabled: true` and usually a `basePath`.

## Capabilities

Common flags. Starter keys include: `docs`, `pages`, `writing`, `projects`, `search`, `rss`, `archive`, `tags`, `readingTime`, `i18n`, `versioning`, …

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

## Hero

Persona preset starter:

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

- i18n: locale folders + config `i18n` block. See site docs `/docs/i18n`.
- Docs versions: `tidypress add-version <slug> --set-latest`.

## Deploy targets

Examples: `tidypress deploy cloudflare` · `github-pages` · `vercel` · `netlify` · `artifact-only`

Use `tidypress deploy --help` for flags such as `--with-ci` and output dir.

## Context snapshot

Every `tidypress build` writes `build/llms.txt`: public URLs plus full markdown bodies for published entries. Respects `published` and `scheduled` frontmatter.
