---
title: Deploy
description: Build static output, copy it, or hand it to the host you already use.
order: 13
---

DocsMint builds static files. Deployment is whatever you do with those files.

```bash
docsmint build
```

Output:

```txt
docs/build/
```

That directory contains HTML, Astro assets, sitemap files, public assets, and the Pagefind search index.

## Preview the production build

```bash
docsmint preview
```

Preview serves the built output locally, with search and sitemap output in place.

## Copy output somewhere else

```bash
docsmint build --output ./dist
```

or:

```bash
docsmint deploy ./release/docs
docsmint deploy file:///tmp/docsmint-site
```

Local path targets copy the built `build/` directory.

## Artifact-only deploy

```bash
docsmint deploy
```

With no target, DocsMint builds the site and prints the artifact path. Upload that directory with your own CI, host, or script. This is an artifact flow, not a hosted deploy.

## Provider CLI targets

These targets call local provider tools:

```bash
docsmint deploy vercel        # runs vercel deploy --prod <build/>
docsmint deploy netlify       # runs netlify deploy --dir <build/> --prod
docsmint deploy surge         # runs surge <build/>
docsmint deploy github-pages  # runs npx gh-pages -d <build/>
docsmint deploy cloudflare    # runs wrangler pages deploy <build/>
```

The command hands your `build/` directory to the selected CLI.

## Docker

```bash
docsmint deploy docker
```

This writes `Dockerfile` and `docker-compose.yml` into `docs/build/`.

Then run:

```bash
cd docs/build
docker compose up -d --build
```

The generated Dockerfile serves the static output with `nginx:alpine`.

## S3

Use an explicit target:

```bash
docsmint deploy s3://my-bucket/docs
```

or set an environment variable:

```bash
DOCSMINT_S3_TARGET=s3://my-bucket/docs docsmint deploy s3
```

DocsMint runs:

```bash
aws s3 sync docs/build/ s3://my-bucket/docs --delete
```

You need the AWS CLI installed and authenticated.

## SSH

Use an SSH-style target:

```bash
docsmint deploy deploy@example.com:/var/www/docs
```

or:

```bash
DOCSMINT_SSH_TARGET=deploy@example.com:/var/www/docs docsmint deploy ssh
```

DocsMint runs:

```bash
rsync -az --delete docs/build/ deploy@example.com:/var/www/docs
```

You need `rsync` and SSH access.

## Other URI targets

Unknown URI schemes are treated as external targets:

```bash
docsmint deploy gs://my-bucket/docs
```

DocsMint builds the site and prints the artifact path for unknown URI schemes.

## CI workflow generation

```bash
docsmint deploy vercel --with-ci
```

This writes `.github/workflows/deploy.yml` for the selected target.

Add the required secrets before using the workflow.

## Nginx

If you copy the output to a server, point Nginx at the static directory:

```nginx
server {
    listen 80;
    server_name docs.example.com;
    root /var/www/docs;
    index index.html;

    location / {
        try_files $uri $uri/ $uri/index.html =404;
    }
}
```

## What to upload

Deploy the contents of:

```txt
docs/build/
```

Do not upload `~/.cache/docsmint/`. Upload only the `build/` contents.
