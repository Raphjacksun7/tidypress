import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'

import { TidyPressError } from '../errors/TidyPressError.js'
import { resolveDeployTarget } from '../application/deployment/deploy-target.js'
import type { CliIo } from '../types.js'

/**
 * @typedef {{ projectRoot: string, distDir: string, target?: string }} DeployRequest
 */

/**
 * @param {{
 *   provider: string
 *   io?: import('../types.js').CliIo
 *   runCommand?: (command: string, args: string[]) => Promise<void>
 * }} options
 */
export function createProviderStrategy({
  provider,
  io = console as unknown as CliIo,
  runCommand = runShellCommand,
}: {
  provider: string
  io?: CliIo
  runCommand?: typeof runShellCommand
}) {
  return {
    id: `provider:${provider}`,
    /**
     * @param {DeployRequest} request
     */
    supports(request) {
      const plan = resolveDeployTarget(request)
      return plan.kind === 'provider' && plan.provider === provider
    },
    /**
     * @param {DeployRequest} request
     */
    async execute(request) {
      const plan = resolveDeployTarget(request)
      if (plan.kind !== 'provider' || plan.provider !== provider) {
        throw new TidyPressError('Provider deploy received unsupported target.', 'DEPLOY_PROVIDER_INTERNAL')
      }
      await executeProvider({ provider, request, io, extra: plan.extra, runCommand })
    },
  }
}

export function createProviderStrategies({
  io = console as unknown as CliIo,
  runCommand = runShellCommand,
}: {
  io?: CliIo
  runCommand?: typeof runShellCommand
} = {}) {
  const providers = ['vercel', 'netlify', 'surge', 'github-pages', 'cloudflare', 'docker', 'static', 's3', 'ssh']
  return providers.map(provider => createProviderStrategy({ provider, io, runCommand }))
}

/**
 * @param {{
 *   provider: string,
 *   request: DeployRequest,
 *   io: import('../types.js').CliIo,
 *   extra?: string,
 *   runCommand: (command: string, args: string[]) => Promise<void>,
 * }} params
 */
async function executeProvider({ provider, request, io, extra, runCommand }) {
  if (provider === 'vercel') {
    await runCommand('vercel', ['deploy', '--prod', request.distDir])
    io.info(`Deployed ${request.distDir} to Vercel`)
    return
  }

  if (provider === 'netlify') {
    await runCommand('netlify', ['deploy', '--dir', request.distDir, '--prod'])
    io.info(`Deployed ${request.distDir} to Netlify`)
    return
  }

  if (provider === 'surge') {
    await runCommand('surge', [request.distDir])
    io.info(`Deployed ${request.distDir} with Surge`)
    return
  }

  if (provider === 'github-pages') {
    await runCommand('npx', ['gh-pages', '-d', request.distDir])
    io.info(`Published ${request.distDir} to GitHub Pages`)
    return
  }

  if (provider === 'cloudflare') {
    await runCommand('wrangler', ['pages', 'deploy', request.distDir])
    io.info(`Deployed ${request.distDir} to Cloudflare Pages`)
    return
  }

  if (provider === 'docker') {
    await fs.writeFile(path.join(request.distDir, 'Dockerfile'), dockerfileTemplate(), 'utf8')
    await fs.writeFile(path.join(request.distDir, 'docker-compose.yml'), dockerComposeTemplate(), 'utf8')
    io.info(`Generated Docker deployment files in ${request.distDir}`)
    return
  }

  if (provider === 'static') {
    io.info(`Static output ready at ${request.distDir}`)
    return
  }

  if (provider === 's3') {
    const target = extra || process.env.TIDYPRESS_S3_TARGET
    if (!target) {
      throw new TidyPressError(
        'Missing S3 deploy target.',
        'DEPLOY_PROVIDER_TARGET_REQUIRED',
        'Use s3://bucket/path or set TIDYPRESS_S3_TARGET',
      )
    }
    await runCommand('aws', ['s3', 'sync', `${request.distDir}/`, target, '--delete'])
    io.info(`Synced ${request.distDir} to ${target}`)
    return
  }

  if (provider === 'ssh') {
    const target = extra || process.env.TIDYPRESS_SSH_TARGET
    if (!target) {
      throw new TidyPressError(
        'Missing SSH deploy target.',
        'DEPLOY_PROVIDER_TARGET_REQUIRED',
        'Use ssh://user@host/path or set TIDYPRESS_SSH_TARGET=user@host:/path',
      )
    }
    await runCommand('rsync', ['-az', '--delete', `${request.distDir}/`, target])
    io.info(`Synced ${request.distDir} to ${target}`)
    return
  }

  io.info(`Provider target "${provider}" selected.`)
  io.info(`Built files ready at ${request.distDir}`)
}

/**
 * @param {string} command
 * @param {string[]} args
 */
function runShellCommand(command: string, args: string[]): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' })

    child.on('error', error => {
      if (error && 'code' in error && error.code === 'ENOENT') {
        reject(
          new TidyPressError(
            `Missing required command: ${command}`,
            'DEPLOY_PROVIDER_COMMAND_MISSING',
            `Install ${command} or choose another deploy target`,
          ),
        )
        return
      }
      reject(error)
    })

    child.on('close', code => {
      if (code === 0) {
        resolve(undefined)
        return
      }
      reject(
        new TidyPressError(
          `Deploy command failed: ${command} ${args.join(' ')}`,
          'DEPLOY_PROVIDER_COMMAND_FAILED',
          'Check command output above and retry',
        ),
      )
    })
  })
}

function dockerfileTemplate() {
  return `FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
`
}

function dockerComposeTemplate() {
  return `services:
  tidypress:
    build: .
    ports:
      - "8080:80"
`
}
