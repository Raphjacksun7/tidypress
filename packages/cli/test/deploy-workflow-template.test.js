import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { DocsMintError } from '../src/errors/DocsMintError.js'
import { renderDeployWorkflow, writeDeployWorkflowTemplate } from '../src/deployment/CiWorkflowTemplates.js'

test('renderDeployWorkflow includes provider command and env secrets', () => {
  const workflow = renderDeployWorkflow({ target: 'vercel', provider: 'vercel' })
  assert.match(workflow, /npx docsmint@latest deploy vercel/)
  assert.match(workflow, /VERCEL_TOKEN/)
})

test('writeDeployWorkflowTemplate writes deploy workflow for provider targets', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'docsmint-ci-workflow-'))

  const workflowPath = await writeDeployWorkflowTemplate({
    projectRoot: root,
    target: 's3://bucket/docs',
  })

  const contents = await fs.readFile(workflowPath, 'utf8')
  assert.equal(workflowPath, path.join(root, '.github/workflows/deploy.yml'))
  assert.match(contents, /npx docsmint@latest deploy s3:\/\/bucket\/docs/)
  assert.match(contents, /DOCSMINT_S3_TARGET/)
})

test('writeDeployWorkflowTemplate writes workflow for named provider target', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'docsmint-ci-workflow-provider-'))

  const workflowPath = await writeDeployWorkflowTemplate({
    projectRoot: root,
    target: 'netlify',
  })

  const contents = await fs.readFile(workflowPath, 'utf8')
  assert.equal(workflowPath, path.join(root, '.github/workflows/deploy.yml'))
  assert.match(contents, /npx docsmint@latest deploy netlify/)
  assert.match(contents, /NETLIFY_AUTH_TOKEN/)
  assert.match(contents, /NETLIFY_SITE_ID/)
})

test('writeDeployWorkflowTemplate rejects non-provider targets', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'docsmint-ci-workflow-invalid-'))

  await assert.rejects(
    async () => {
      await writeDeployWorkflowTemplate({
        projectRoot: root,
        target: './dist',
      })
    },
    error => {
      assert.ok(error instanceof DocsMintError)
      assert.equal(error.code, 'DEPLOY_CI_TARGET_REQUIRED')
      assert.equal(error.exitCode, 2)
      return true
    },
  )
})
