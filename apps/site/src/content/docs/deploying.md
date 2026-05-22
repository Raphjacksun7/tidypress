---
title: Deploying
description: Build once, deploy anywhere.
order: 5
---

DocsMint is host-agnostic. It produces static assets, then lets you choose where and how to publish.

## Build artifact

```bash
docsmint build
```

Output: `docs/.docsmint/dist/` (HTML, `_astro` assets, and `pagefind` index).

## Deploy command flow

`docsmint deploy` always runs a build first, then selects one strategy:

- no target: report artifact path only
- local path target (`./public-docs`, `file:///tmp/site`): copy `dist` there
- provider target (`vercel`, `netlify`, `surge`, `github-pages`, `cloudflare`): run provider CLI
- DIY target (`docker`, `static`, `s3`, `ssh`): run local deploy-diy workflow
- other URI target (`gs://bucket`, etc.): print host-agnostic upload instructions

Examples:

```bash
docsmint deploy
docsmint deploy ./release/docs
docsmint deploy file:///tmp/docsmint-site
docsmint deploy docker
docsmint deploy static
docsmint deploy s3://my-bucket/docs
docsmint deploy ssh://deploy@example.com/var/www/site
docsmint deploy gs://my-bucket/docs
```

## Serve with Nginx

Copy `docs/.docsmint/dist/` to your server, then point nginx at it:

```nginx
server {
    listen 80;
    server_name docs.example.com;
    root /var/www/docs/dist;
    index index.html;

    location / {
        try_files $uri $uri/ $uri/index.html =404;
    }
}
```

## Docker

Generate deployment files directly in `docs/.docsmint/dist/`:

```bash
docsmint deploy docker
```

This writes:

- `Dockerfile`
- `docker-compose.yml`

Then build and run from the dist directory:

```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
```

```bash
cd docs/.docsmint/dist
docker compose up -d --build
```

## Static hosts

Confirm static artifact output without running a provider command:

```bash
docsmint deploy static
```

Then upload `docs/.docsmint/dist/` to any static file host:

- **GitHub Pages** — push `dist/` to the `gh-pages` branch
- **Azure Static Web Apps** — output dir `docs/.docsmint/dist`
- **Netlify / Vercel** — build command `docsmint build`, publish dir `docs/.docsmint/dist`
- **S3 / GCS / Azure Blob** — sync static files from `docs/.docsmint/dist`

### S3 sync

Use either an explicit URI target or `DOCSMINT_S3_TARGET`:

```bash
docsmint deploy s3://my-bucket/docs
# or
DOCSMINT_S3_TARGET=s3://my-bucket/docs docsmint deploy s3
```

Under the hood this runs:

```bash
aws s3 sync docs/.docsmint/dist/ s3://my-bucket/docs --delete
```

### SSH sync

Use either a URI/SCP target or `DOCSMINT_SSH_TARGET`:

```bash
docsmint deploy deploy@example.com:/var/www/docs
# or
DOCSMINT_SSH_TARGET=deploy@example.com:/var/www/docs docsmint deploy ssh
```

Under the hood this runs:

```bash
rsync -az --delete docs/.docsmint/dist/ deploy@example.com:/var/www/docs
```

## CI example

Generate a starter workflow from the CLI:

```bash
docsmint deploy vercel --with-ci
```

This writes `.github/workflows/deploy.yml` with required secret placeholders for the selected provider.

Custom CI flow:

```yaml
steps:
  - run: npm install -g docsmint
  - run: docsmint build
  - run: rsync -av docs/.docsmint/dist/ user@host:/var/www/docs/
```
