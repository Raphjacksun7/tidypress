import test from 'node:test'
import assert from 'node:assert/strict'

import { TidyPressError } from '../src/errors/TidyPressError.js'
import { DomainSetupService } from '../src/services/DomainSetupService.js'

function createConfigLoader(siteUrl) {
  const resolvedSiteUrl = arguments.length === 0 ? 'https://old.example.com' : siteUrl
  return {
    async resolveDocsDirectory() {
      return '/workspace/docs'
    },
    async loadConfig() {
      return { siteUrl: resolvedSiteUrl }
    },
  }
}

test('DomainSetupService returns platform instructions and suggested siteUrl', async () => {
  const service = new DomainSetupService({ configLoader: createConfigLoader() })
  const result = await service.setup({
    projectRoot: '/workspace',
    domain: 'Docs.Example.com',
    platform: 'vercel',
  })

  assert.equal(result.docsDir, '/workspace/docs')
  assert.equal(result.configSiteUrl, 'https://old.example.com')
  assert.equal(result.resolvedDomain, 'docs.example.com')
  assert.equal(result.domainSource, 'argument')
  assert.equal(result.suggestedSiteUrl, 'https://docs.example.com')
  assert.equal(result.platform, 'vercel')
  assert.ok(result.instructions.length > 0)
})

test('DomainSetupService falls back to config siteUrl when domain argument is omitted', async () => {
  const service = new DomainSetupService({ configLoader: createConfigLoader('https://myblog.example.com') })
  const result = await service.setup({
    projectRoot: '/workspace',
    platform: 'netlify',
  })

  assert.equal(result.resolvedDomain, 'myblog.example.com')
  assert.equal(result.domainSource, 'config')
  assert.equal(result.suggestedSiteUrl, 'https://myblog.example.com')
  assert.equal(result.platform, 'netlify')
})

test('DomainSetupService errors when domain argument and config siteUrl are missing', async () => {
  const service = new DomainSetupService({ configLoader: createConfigLoader(undefined) })
  await assert.rejects(
    async () => {
      await service.setup({
        projectRoot: '/workspace',
        platform: 'vercel',
      })
    },
    error => {
      assert.ok(error instanceof TidyPressError)
      assert.equal(error.code, 'INVALID_DOMAIN_VALUE')
      assert.equal(error.exitCode, 2)
      return true
    },
  )
})

test('DomainSetupService rejects invalid domains', async () => {
  const service = new DomainSetupService({ configLoader: createConfigLoader() })
  await assert.rejects(
    async () => {
      await service.setup({
        projectRoot: '/workspace',
        domain: 'https://docs.example.com/path',
        platform: 'vercel',
      })
    },
    error => {
      assert.ok(error instanceof TidyPressError)
      assert.equal(error.code, 'INVALID_DOMAIN_VALUE')
      assert.equal(error.exitCode, 2)
      return true
    },
  )
})

test('DomainSetupService rejects unsupported platforms', async () => {
  const service = new DomainSetupService({ configLoader: createConfigLoader() })
  await assert.rejects(
    async () => {
      await service.setup({
        projectRoot: '/workspace',
        domain: 'docs.example.com',
        platform: 'render',
      })
    },
    error => {
      assert.ok(error instanceof TidyPressError)
      assert.equal(error.code, 'INVALID_DOMAIN_PLATFORM')
      assert.equal(error.exitCode, 2)
      return true
    },
  )
})
