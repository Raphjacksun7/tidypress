import fs from 'node:fs/promises'
import path from 'node:path'

import { TidyPressError } from '../errors/TidyPressError.js'

/**
 * Scaffolds folder-based docs versions.
 */
export class AddVersionService {
  configLoader: any


  /**
   * @param {{ configLoader: import('./ConfigLoader.js').ConfigLoader }} dependencies
   */
  constructor({ configLoader }) {
    this.configLoader = configLoader
  }

  /**
   * @param {{ projectRoot: string, versionLabel: string, setLatest: boolean }} request
   * @returns {Promise<{ versionDir: string, latestLinkPath?: string }>}
   */
  async run({ projectRoot, versionLabel, setLatest }) {
    const normalized = this.#normalizeVersionLabel(versionLabel)
    const docsDir = await this.configLoader.resolveDocsDirectory({ projectRoot })
    const contentRoot = path.join(docsDir, 'src', 'content', 'docs')
    const versionDir = path.join(contentRoot, normalized)
    await fs.mkdir(versionDir, { recursive: true })
    await this.#ensureGettingStarted(versionDir, normalized)

    /** @type {string | undefined} */
    let latestLinkPath
    if (setLatest) {
      latestLinkPath = path.join(contentRoot, 'latest')
      await fs.rm(latestLinkPath, { recursive: true, force: true })
      const relativeTarget = path.relative(contentRoot, versionDir)
      await fs.symlink(relativeTarget, latestLinkPath, 'junction')
    }

    return {
      versionDir,
      latestLinkPath,
    }
  }

  /**
   * @param {string} versionLabel
   * @returns {string}
   */
  #normalizeVersionLabel(versionLabel) {
    const trimmed = versionLabel.trim()
    if (!trimmed) {
      throw new TidyPressError('Version label cannot be empty.', 'INVALID_VERSION_LABEL', 'Use labels like 1.0 or v2.0', {
        exitCode: 2,
      })
    }
    const normalized = trimmed.startsWith('v') ? trimmed : `v${trimmed}`
    if (!/^v[0-9]+(?:\.[0-9]+)*$/.test(normalized)) {
      throw new TidyPressError(
        `Invalid version label "${versionLabel}".`,
        'INVALID_VERSION_LABEL',
        'Use semantic labels like 1.0 or v2.0',
        { exitCode: 2 },
      )
    }
    return normalized
  }

  /**
   * @param {string} versionDir
   * @param {string} versionLabel
   * @returns {Promise<void>}
   */
  async #ensureGettingStarted(versionDir, versionLabel) {
    const target = path.join(versionDir, 'getting-started.md')
    try {
      await fs.access(target)
      return
    } catch {
      // file does not exist; create it
    }
    const contents = `---
title: Getting Started (${versionLabel})
description: Overview for ${versionLabel}.
order: 1
---

# Getting Started (${versionLabel})

Document changes for this version here.
`
    await fs.writeFile(target, contents, 'utf8')
  }
}
