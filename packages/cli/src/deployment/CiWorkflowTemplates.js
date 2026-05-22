import fs from 'node:fs/promises'
import path from 'node:path'

import { DocsMintError } from '../errors/DocsMintError.js'

const TEMPLATE_ENV = {
  vercel: ['VERCEL_TOKEN'],
  netlify: ['NETLIFY_AUTH_TOKEN', 'NETLIFY_SITE_ID'],
  surge: ['SURGE_LOGIN', 'SURGE_TOKEN'],
  'github-pages': ['GITHUB_TOKEN'],
  cloudflare: ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID'],
  docker: ['DOCKERHUB_USERNAME', 'DOCKERHUB_TOKEN'],
  static: [],
  s3: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION', 'DOCSMINT_S3_TARGET'],
  ssh: ['DOCSMINT_SSH_TARGET', 'SSH_PRIVATE_KEY'],
}

/**
 * @param {{ projectRoot: string, target?: string }} request
 * @returns {Promise<string>}
 */
export async function writeDeployWorkflowTemplate(request) {
  const plan = resolveDeployCiTarget(request.target)

  const workflowDir = path.join(request.projectRoot, '.github/workflows')
  const workflowPath = path.join(workflowDir, 'deploy.yml')
  await fs.mkdir(workflowDir, { recursive: true })
  await fs.writeFile(
    workflowPath,
    renderDeployWorkflow({
      target: plan.commandTarget,
      provider: plan.provider,
    }),
    'utf8',
  )
  return workflowPath
}

/**
 * @param {{ target: string, provider: string }} options
 * @returns {string}
 */
export function renderDeployWorkflow({ target, provider }) {
  const env = TEMPLATE_ENV[provider] ?? []
  const envBlock = env
    .map(name => `          ${name}: \${{ secrets.${name} }}`)
    .join('\n')
  const envSection = envBlock ? `\n        env:\n${envBlock}` : ''

  return `name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Deploy docs
        run: npx docsmint@latest deploy ${target}${envSection}
`
}

/**
 * @param {string | undefined} target
 * @returns {{ provider: string, commandTarget: string }}
 */
function resolveDeployCiTarget(target) {
  if (!target) {
    throw invalidCiTargetError()
  }
  if (target in TEMPLATE_ENV) {
    return { provider: target, commandTarget: target }
  }
  if (target.startsWith('s3://')) {
    return { provider: 's3', commandTarget: target }
  }
  if (target.startsWith('ssh://') || isSshScpTarget(target)) {
    return { provider: 'ssh', commandTarget: target }
  }
  throw invalidCiTargetError()
}

/**
 * @param {string} target
 * @returns {boolean}
 */
function isSshScpTarget(target) {
  return /^[^/\s:@]+@[^/\s:]+:.+/.test(target)
}

function invalidCiTargetError() {
  return new DocsMintError(
    'deploy --with-ci requires a deploy provider target.',
    'DEPLOY_CI_TARGET_REQUIRED',
    'Use docsmint deploy <provider> --with-ci (for example: vercel, netlify, s3, ssh)',
    { exitCode: 2 },
  )
}
