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
- local path target (`./public-docs`): copy `dist` there
- URI target (`gs://bucket`, `s3://bucket`, etc.): print host-agnostic upload instructions

Examples:

```bash
docsmint deploy
docsmint deploy ./release/docs
docsmint deploy file:///tmp/docsmint-site
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

Two-stage image: build static output, then serve with nginx.

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY . .
RUN npm i -g docsmint
RUN docsmint build

FROM nginx:alpine
COPY --from=builder /app/docs/.docsmint/dist /usr/share/nginx/html
EXPOSE 80
```

```bash
docker build -t my-docs .
docker run -p 8080:80 my-docs
```

## Static hosts

Upload `docs/.docsmint/dist/` to any static file host:

- **GitHub Pages** — push `dist/` to the `gh-pages` branch
- **Azure Static Web Apps** — output dir `docs/.docsmint/dist`
- **Netlify / Vercel** — build command `docsmint build`, publish dir `docs/.docsmint/dist`
- **S3 / GCS / Azure Blob** — sync static files from `docs/.docsmint/dist`

## CI example

```yaml
steps:
  - run: npm install -g docsmint
  - run: docsmint build
  - run: rsync -av docs/.docsmint/dist/ user@host:/var/www/docs/
```
