---
title: Examples
description: Runnable example projects for common TidyPress shapes.
order: 4
---

The repository keeps focused examples under `examples/`.

Use them when you want one publish-root shape—writing-first lab, blog-only, body-of-work—without copying the full TidyPress marketing site.

## Minimal

```bash
pnpm --filter @tidypress/example-minimal build
```

`examples/minimal` is the smallest runnable project. It mirrors the default `tidypress init` shape:

```txt
examples/minimal/site/
├── tidypress.config.ts
└── src/content/
    ├── docs/getting-started.md
    └── writing/hello.md
```

Use it to test the basic docs + writing flow.

## Lab

```bash
pnpm --filter @tidypress/example-lab build
```

`examples/lab` matches `tidypress init` (lab preset): writing and projects on the home page, docs off.

## Blog

```bash
pnpm --filter @tidypress/example-blog build
```

`examples/blog` matches `tidypress init --preset blog`: writing only; docs, projects, and pages off.

## Persona

```bash
pnpm --filter @tidypress/example-persona build
```

`examples/persona` matches `tidypress init --preset persona`: opt-in hero, projects, writing, and an about page.

## Body of work

```bash
npx tidypress init --preset body-of-work
```

Seeds works, projects, writing, reference, and process collections. See [Body of work](./body-of-work).

## i18n and versions

```bash
pnpm --filter @tidypress/example-i18n-versioned build
```

`examples/i18n-versioned` shows:

- latest docs at `/docs`
- archived docs at `/docs/v1`
- French routes under `/fr`
- default-locale content without an `en/` folder

## Custom collections

```bash
pnpm --filter @tidypress/example-custom-collections build
```

`examples/custom-collections` adds a `playbooks` collection:

```ts
collections: {
  playbooks: {
    enabled: true,
    basePath: '/playbooks',
    kind: 'content',
    label: 'playbooks',
  },
}
```

Use this when writing, projects, and the `docs` collection are not enough for the shape of your site.

## Product docs site

`apps/site` is the full TidyPress documentation site in this repository. The focused examples are better starting points when you want a small fixture to copy.
