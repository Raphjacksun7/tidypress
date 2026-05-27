import test from 'node:test'
import assert from 'node:assert/strict'

import { DomainCommand } from '../src/commands/domain.js'

test('DomainCommand prints actionable setup guidance', async () => {
  /** @type {string[]} */
  const infoMessages = []
  const command = new DomainCommand({
    domainSetupService: /** @type {import('../src/services/DomainSetupService.js').DomainSetupService} */ (/** @type {any} */ ({
      async setup() {
        return {
          docsDir: '/workspace/docs',
          resolvedDomain: 'docs.example.com',
          domainSource: 'argument',
          suggestedSiteUrl: 'https://docs.example.com',
          platform: 'vercel',
          configSiteUrl: 'https://old.example.com',
          instructions: ['Add domain in dashboard.', 'Apply requested DNS record.'],
        }
      },
    })),
    io: {
      info(message) {
        infoMessages.push(message)
      },
    },
  })

  await command.execute({
    projectRoot: '/workspace',
    action: 'setup',
    domain: 'docs.example.com',
    platform: 'vercel',
  })

  assert.ok(infoMessages.some(message => message.includes('Domain setup plan for https://docs.example.com')))
  assert.ok(infoMessages.some(message => message.includes('Current siteUrl is https://old.example.com')))
  assert.ok(infoMessages.some(message => message.includes('OG image URLs will resolve from https://docs.example.com/og.svg')))
})

test('DomainCommand reports when domain is detected from config', async () => {
  /** @type {string[]} */
  const infoMessages = []
  const command = new DomainCommand({
    domainSetupService: /** @type {import('../src/services/DomainSetupService.js').DomainSetupService} */ (/** @type {any} */ ({
      async setup() {
        return {
          docsDir: '/workspace/docs',
          resolvedDomain: 'myblog.example.com',
          domainSource: 'config',
          suggestedSiteUrl: 'https://myblog.example.com',
          platform: 'netlify',
          configSiteUrl: 'https://myblog.example.com',
          instructions: ['Add domain in dashboard.'],
        }
      },
    })),
    io: {
      info(message) {
        infoMessages.push(message)
      },
    },
  })

  await command.execute({
    projectRoot: '/workspace',
    action: 'setup',
    platform: 'netlify',
  })

  assert.ok(infoMessages.some(message => message.includes('Using domain detected from siteUrl: myblog.example.com')))
})
