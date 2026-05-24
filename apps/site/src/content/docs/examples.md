---
title: Examples
description: Runnable example projects for common DocsMint shapes.
order: 4
---

The repository keeps focused examples under `examples/`.

Use the examples when you want to see one site shape without the full product documentation site.

## Minimal

```bash
pnpm --filter @docsmint/example-minimal build
```

`examples/minimal` is the smallest runnable project. It mirrors the default `docsmint init` shape:

```txt
examples/minimal/docs/
├── docsmint.config.ts
└── src/content/
    ├── docs/getting-started.md
    └── writing/hello.md
```

Use it to test the basic docs + writing flow.

## Lab

```bash
pnpm --filter @docsmint/example-lab build
```

`examples/lab` matches `docsmint init` (lab preset): writing and projects on the home page, docs off.

## Blog

```bash
pnpm --filter @docsmint/example-blog build
```

`examples/blog` matches `docsmint init --preset blog`: writing only; docs, projects, and pages off.

## Persona

```bash
pnpm --filter @docsmint/example-persona build
```

`examples/persona` matches `docsmint init --preset persona`: opt-in hero, projects, writing, and an about page.

## i18n and versions

```bash
pnpm --filter @docsmint/example-i18n-versioned build
```

`examples/i18n-versioned` shows:

- latest docs at `/docs`
- archived docs at `/docs/v1`
- French routes under `/fr`
- default-locale content without an `en/` folder

## Custom collections

```bash
pnpm --filter @docsmint/example-custom-collections build
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

Use this when docs and writing are not enough for the shape of your site.

## Product docs site

`apps/site` is the full DocsMint site. It is useful as a larger dogfood fixture, but the focused examples are better starting points for copying.
