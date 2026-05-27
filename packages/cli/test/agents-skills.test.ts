import assert from 'node:assert/strict'
import { access, mkdir, mkdtemp, readFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { detectAgents } from '../src/agents-skills/agents.js'
import {
  BUNDLED_SKILL_NAMES,
  maybeInstallTidyPressSkillsGlobally,
  resolveBundledSkillsRoot,
} from '../src/agents-skills/install.js'
import {
  readSkillsInstallMetadata,
  writeSkillsInstallMetadata,
} from '../src/agents-skills/metadata.js'

test('bundled skills include tidypress and SKILL.md files', async () => {
  const root = resolveBundledSkillsRoot()
  for (const name of BUNDLED_SKILL_NAMES) {
    await access(path.join(root, name, 'SKILL.md'))
  }
})

test('detectAgents returns an array', async () => {
  const agents = await detectAgents()
  assert.ok(Array.isArray(agents))
})

test('metadata round-trip in temp home', async () => {
  const tempHome = await mkdtemp(path.join(os.tmpdir(), 'tidypress-skills-meta-'))
  const originalHome = process.env.HOME
  process.env.HOME = tempHome
  try {
    await writeSkillsInstallMetadata({
      version: 1,
      accepted: true,
      date: new Date().toISOString(),
      detectedAgentIds: ['cursor'],
    })
    const read = await readSkillsInstallMetadata()
    assert.equal(read?.accepted, true)
    assert.deepEqual(read?.detectedAgentIds, ['cursor'])
  } finally {
    if (originalHome === undefined) {
      delete process.env.HOME
    } else {
      process.env.HOME = originalHome
    }
    await rm(tempHome, { recursive: true, force: true })
  }
})

test('maybeInstall skips when already prompted', async () => {
  const tempHome = await mkdtemp(path.join(os.tmpdir(), 'tidypress-skills-skip-'))
  const originalHome = process.env.HOME
  const ciEnv = ['CI', 'CONTINUOUS_INTEGRATION', 'GITHUB_ACTIONS', 'GITLAB_CI'] as const
  const savedCi: Record<string, string | undefined> = {}
  for (const key of ciEnv) {
    savedCi[key] = process.env[key]
    delete process.env[key]
  }
  process.env.HOME = tempHome
  const io = { info() {}, warn() {} }
  try {
    await writeSkillsInstallMetadata({
      version: 1,
      accepted: false,
      date: new Date().toISOString(),
    })
    const result = await maybeInstallTidyPressSkillsGlobally({ force: false, io })
    assert.equal(result.status, 'skipped')
    assert.equal(result.reason, 'already_prompted')
  } finally {
    if (originalHome === undefined) {
      delete process.env.HOME
    } else {
      process.env.HOME = originalHome
    }
    for (const key of ciEnv) {
      if (savedCi[key] === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = savedCi[key]
      }
    }
    await rm(tempHome, { recursive: true, force: true })
  }
})

test('force install copies skills into a synthetic agent directory', async () => {
  const tempHome = await mkdtemp(path.join(os.tmpdir(), 'tidypress-skills-install-'))
  const agentSkills = path.join(tempHome, '.cursor', 'skills')
  const originalHome = process.env.HOME
  process.env.HOME = tempHome
  const io = { info() {}, warn() {} }

  try {
    await mkdir(path.join(tempHome, '.cursor'), { recursive: true })
    const result = await maybeInstallTidyPressSkillsGlobally({ force: true, io })
    assert.equal(result.status, 'installed')
    const skillMd = await readFile(path.join(agentSkills, 'tidypress', 'SKILL.md'), 'utf8')
    assert.match(skillMd, /tidypress/)
  } finally {
    if (originalHome === undefined) {
      delete process.env.HOME
    } else {
      process.env.HOME = originalHome
    }
    await rm(tempHome, { recursive: true, force: true })
  }
})
