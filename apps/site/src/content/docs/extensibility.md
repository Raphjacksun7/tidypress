---
title: Extending DocsMint
description: Advanced rendering hooks for custom collections and custom docs forms.
order: 11
---

Project-local presentation hooks for custom sections and docs forms.

## Two axes

DocsMint separates content location from page model:

| Axis | Declared in | Use for |
|------|-------------|---------|
| Collection | `collections.<key>` | a site section and base path |
| Doc form | docs frontmatter `form` | a page model inside the docs collection |

Folders build URLs. They do not declare page models.

## Built-in docs forms

Docs pages support:

| `form` | Layout |
|--------|--------|
| `doc` | default docs page with sidebar, table of contents, and chapter navigation |
| `manual` | procedural page chrome and step styling |

```yaml
---
title: Install guide
form: manual
order: 1
---
```

Doc pages can set `part` for chapter grouping:

```yaml
---
title: Routing
part: Part I
order: 2
---
```

Doc chapter navigation follows the configured sidebar order when present, then frontmatter `order`.

## Custom collections

Add another section with a built-in kind:

```ts
collections: {
  guides: {
    enabled: true,
    basePath: '/guides',
    kind: 'content',
    label: 'guides',
  },
}
```

Kinds: `content`, `writing`, `page`.

## Custom collection rendering

Project-local presentation code:

```ts
collections: {
  api: {
    enabled: true,
    basePath: '/api',
    kind: 'content',
    render: {
      presentation: './site/renderers/api-presentation.ts',
      views: './site/views/api/',
    },
  },
}
```

On `docsmint dev` and `docsmint build`:

1. The config is validated.
2. DocsMint writes a plugin manifest into `.docsmint/src/generated/`.
3. Referenced project paths are mounted into the workdir.
4. The engine imports the presentation module.
5. `RouteViewShell` uses your view when a matching key exists.

Paths must be project-local `./` paths. Parent directory traversal is rejected.

`collections.docs` cannot set `render`. Docs pages use `form`.

## Presentation module

Export `createPresentation(site, context)`:

```ts
import type { DocsMintConfig } from '@docsmint/config'
import type { DocsMintPluginPresentation } from '@docsmint/engine/plugins'

export function createPresentation(
  site: DocsMintConfig,
  context: { collectionKey: string },
): DocsMintPluginPresentation {
  return {
    async buildIndex(route) {
      return {
        viewKey: `${context.collectionKey}:collection-index`,
        site,
        route,
        title: 'API',
        headings: [],
        pagefindIgnore: true,
      }
    },
    async buildEntry(route) {
      return {
        viewKey: `${context.collectionKey}:collection-entry`,
        site,
        route,
        title: route.slug ?? 'API entry',
        headings: [],
        pagefindIgnore: false,
      }
    },
  }
}
```

Prefix view keys with the collection key.

## Optional Astro views

If `render.views` points to `./site/views/api/`, DocsMint looks for:

```txt
collection-index.astro
collection-entry.astro
version-root.astro
```

Missing files are skipped. Built-in views are used as fallback.

## Custom docs forms

Register custom forms with `extensions.docForms`:

```ts
extensions: {
  docForms: {
    'api-reference': {
      label: 'API reference',
      presentation: './site/renderers/api-reference-presentation.ts',
      views: './site/views/api-reference/',
    },
  },
}
```

Then use the form in docs frontmatter:

```yaml
---
title: POST /v1/widgets
form: api-reference
---
```

Built-in form names cannot be overridden.

## Development reload

During `docsmint dev`, changes to config, presentation modules, and optional views regenerate the plugin manifest and reload the browser.

If a plugin path or export is invalid, DocsMint fails before the server starts. Fix the config path or module export and run again.
