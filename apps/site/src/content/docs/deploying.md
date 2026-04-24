---
title: Deploying
description: Deploy your docsmint site to any static host.
order: 5
---

docsmint builds to static HTML. Deploy it anywhere that serves files.

## Build

```bash
docsmint build
```

Output goes to `docs/.docsmint/dist/` — HTML pages, CSS/JS bundles, and Pagefind search indexes.

## Nginx

The simplest production setup: copy `dist/` to your server and point nginx at it.

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

Two-stage build: Node.js builder + nginx server.

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY docs/.docsmint/package*.json ./
RUN npm ci
COPY docs/.docsmint/ .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

```bash
docker build -t my-docs .
docker run -p 8080:80 my-docs
```

## Static hosting

`dist/` is plain HTML. Upload it to any static host:

- **GitHub Pages** — push `dist/` to the `gh-pages` branch
- **Azure Static Web Apps** — point build output to `dist/`
- **Netlify / Vercel** — set build command to `docsmint build`, output dir to `docs/.docsmint/dist`
- **S3 / Azure Blob** — sync `dist/` with static website hosting enabled

## Azure DevOps CI

```yaml
- script: |
    pip install docsmint \
      --index-url https://centiro.pkgs.visualstudio.com/_packaging/Internal_Python/pypi/simple/ \
      --extra-index-url https://pypi.org/simple/
    docsmint build
  displayName: 'Build docs'

- task: AzureStaticWebApp@0
  inputs:
    app_location: 'docs/.docsmint/dist'
  displayName: 'Deploy to Azure Static Web Apps'
```
