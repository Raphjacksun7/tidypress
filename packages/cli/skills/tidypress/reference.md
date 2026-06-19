# TidyPress config reference

Agent-oriented compact reference.

## Publish root vs docs collection

- **Publish root:** folder with `tidypress.config.ts`. `init` defaults to `site/`.
- **`docs` collection:** `src/content/docs/` → routes under `/docs/…` (first-class; disabled in `lab` / `body-of-work` presets by default).
- **Discovery:** cwd → `site/` → sibling folders. Set `TIDYPRESS_PUBLISH_ROOT` when ambiguous.

## CLI commands

| Command | Notes |
|---------|-------|
| `init` | `--preset`, `--site-url` |
| `migrate-sections` | sections→collections migration scaffold |
| `dev` / `preview` | `--port` |
| `build` | `--output`, `--no-llms-txt` |
| `deploy` | provider target; `deploy --help` for flags |
| `domain` | custom domain setup plan |
| `doctor` | baseline setup check |
| `import devto` | live import; other providers scaffold only |
| `skills install` | `--force`; or global `tidypress --install-skills` |
| `add-version` | docs version folder; `--set-latest` |
| `release-check` | release metadata alignment |
| `editor` / `export` / `ai` | experimental; require config flags |

**Skills detection:** presence of `~/.cursor`, `~/.claude`, or `~/.codex` under `$HOME` — not binary checks.

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

## Frontmatter

### Docs

| Field | Purpose |
|-------|---------|
| `title`, `description` | Required metadata |
| `order` | Sidebar order (lower first) |
| `form` | `doc` (default) or `manual` |
| `part` | Optional chapter group |
| `paging` | `false`, `'none'`, `'top'`, `'bottom'` |
| `icon`, `tags` | Optional |
| `search` | `false` to exclude from Pagefind |
| `published` | `false` hides from routes, search, `llms.txt` |
| `scheduled` | ISO datetime; hidden until then |

### Writing

| Field | Purpose |
|-------|---------|
| `title`, `description`, `date` | Required |
| `author`, `icon`, `featured`, `ogImage`, `tags` | Optional |
| `search` | `false` to exclude from Pagefind |
| `published` | `false` for drafts |
| `scheduled` | ISO datetime; hidden until then |

### Projects

| Field | Purpose |
|-------|---------|
| `title`, `description` | Required |
| `status` | Card label, e.g. `active` |
| `featured`, `icon`, `tags` | Optional |
| `url` | External link |
| `repo` | Repository URL when `url` omitted |
| `linkOnly` | `true` with `url` or `repo` for card-only external links |
| `search`, `published` | Same semantics as writing |

### Pages

| Field | Purpose |
|-------|---------|
| `title`, `description` | Required |
| `search`, `published` | Optional visibility |

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

## MDX components

Use in `.mdx` without imports:

| Component | Purpose |
|-----------|---------|
| `<Callout type?>` | `note`, `warning`, `tip`, `quote` |
| `<FileTree>` | collapsible tree; two spaces per indent; `- site/` root |
| `<Mermaid code={\`…\`}>` | diagram |
| `<Tabs labels={['a','b']}>` + `<Tab>` | tabbed examples |
| `<Image src alt caption?>` | image with optional caption |
| `<Steps>` + `<Step title?>` | numbered procedure |
| `<Tooltip tip="…">` | inline hover text |

## i18n / versions

- i18n: locale folders + config `i18n` block. See site docs `/docs/i18n`.
- Docs versions: `tidypress add-version <slug> --set-latest`.

## Deploy targets

Examples: `tidypress deploy cloudflare` · `github-pages` · `vercel` · `netlify` · `artifact-only`

Use `tidypress deploy --help` for flags such as `--with-ci` and output dir.

## Build artifact for agents

Every `tidypress build` writes `build/llms.txt`: public URLs plus full markdown bodies for published entries. Respects `published` and `scheduled` frontmatter.
