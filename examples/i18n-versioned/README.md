# i18n + Versioned Docs Example

This example keeps the latest English docs at `/docs`, adds French routes under `/fr/docs`, and archives v1 under `/docs/v1`.

It proves locale-prefixed routes, default-locale root paths, fallback content, and folder-based versions.

Run from the repo root after `pnpm install`.

## Build

```sh
pnpm --filter @docsmint/example-i18n-versioned build
```

Output:

```txt
examples/i18n-versioned/docs/build/
```

Inspect:

```txt
/docs
/fr/docs
/docs/v1
```

Docs: <https://usedocsmint.pages.dev/docs/advanced-configuration>
