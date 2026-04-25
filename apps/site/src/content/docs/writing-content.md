---
title: Writing content
description: Markdown, frontmatter fields, MDX components, and file organization.
order: 3
---

DocsMint uses standard markdown with MDX extensions. In a user project, docs live in `docs/src/content/docs/`. Writing (blog posts, engineering notes) lives in `docs/src/content/writing/`.

## Frontmatter

Every file begins with YAML frontmatter.

**Docs pages:**

```yaml
---
title: Page title
description: Short description for metadata.
order: 1
---
```

**Writing posts:**

```yaml
---
title: Post title
date: "2026-04-11"
description: Short description.
author: Raph
---
```

| Field | Required for | Purpose |
|-------|-------------|---------|
| `title` | docs, writing | Page heading and browser title |
| `description` | docs, writing | Meta description |
| `order` | docs | Sidebar sort position. Lower = first. Default: 99 |
| `date` | writing | Publication date. ISO 8601 (`YYYY-MM-DD`). Determines sort order |
| `author` | writing | Optional. Displayed below the date |

## Headings

Use `##` for sections, `###` for subsections. `#` is reserved — docsmint renders `title` from frontmatter as the page heading.

## Code blocks

Fenced blocks with a language tag get syntax highlighting:

```python
def greet(name: str) -> str:
    return f"Hello, {name}"
```

Supported languages include `python`, `typescript`, `javascript`, `bash`, `sql`, `yaml`, `go`, `rust`, `json`, `dockerfile`, and [many more](https://shiki.matsu.io/languages).

Inline `code` renders without highlighting — styled as monospace by the theme.

## Diagrams

Use the `<Mermaid>` component in `.mdx` files for flow charts, sequence diagrams, and more:

```mdx
import Mermaid from '../../components/Mermaid.astro'

<Mermaid code={`
flowchart LR
  A[Write markdown] --> B[docsmint build]
  B --> C[Static HTML]
  C --> D[Deploy anywhere]
`} />
```

Diagrams re-render automatically when the theme changes (light ↔ dark).

## Collapsible sections

Native HTML — no import needed in any `.md` or `.mdx` file:

```html
<details>
<summary>Full output</summary>

Content here. Supports markdown, code blocks, and tables.

</details>
```

Add `open` to start expanded:

```html
<details open>
<summary>Benchmark results</summary>

| Run | Latency |
|-----|---------|
| p50 | 12ms    |
| p99 | 47ms    |

</details>
```

## Links

Standard markdown links work as expected:

```markdown
[Getting started](./getting-started)        <!-- relative doc link -->
[Writing index](/writing)                   <!-- absolute path -->
[External](https://example.com)             <!-- opens in new tab automatically -->
```

External links automatically get `target="_blank" rel="noopener noreferrer"`.

## Images

Place images in `public/` and reference them with absolute paths:

```markdown
![Architecture diagram](/arch.png)
```

Or use the `<Image>` component for local optimized images:

```mdx
import Image from '../../components/Image.astro'

<Image src={import('./arch.png')} alt="Architecture diagram" caption="System overview" />
```

## File organization

Files in `docs/src/content/docs/` map directly to URLs:

```
docs/src/content/docs/
├── getting-started.md     → /docs/getting-started
├── configuration.md       → /docs/configuration
└── guides/
    ├── custom-theme.md    → /docs/guides/custom-theme
    └── deployment.md      → /docs/guides/deployment
```

Files in subdirectories appear under a labeled section header in the sidebar. Sort order within each section is controlled by the `order` frontmatter field.

Files in `docs/src/content/writing/` map to `/writing/<slug>` and appear on the writing index sorted by date descending.
