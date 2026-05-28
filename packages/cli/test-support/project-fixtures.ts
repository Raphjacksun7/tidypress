import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { DEFAULT_PUBLISH_ROOT_DIR } from '../src/infrastructure/project/config.js'

/**
 * Create a temporary publish-root fixture with config and content roots.
 *
 * @param {{ configSource: string, publishRootName?: string }} options
 * @returns {Promise<{ root: string, docsDir: string }>}
 */
export async function createDocsProjectFixture({
  configSource,
  publishRootName = DEFAULT_PUBLISH_ROOT_DIR,
}) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tidypress-config-loader-'))
  const docsDir = path.join(root, publishRootName)
  await fs.mkdir(path.join(docsDir, 'src/content/docs'), { recursive: true })
  await fs.mkdir(path.join(docsDir, 'src/content/writing'), { recursive: true })
  await fs.writeFile(path.join(docsDir, 'src/content/docs/getting-started.md'), '# docs', 'utf8')
  await fs.writeFile(path.join(docsDir, 'src/content/writing/hello.md'), '# writing', 'utf8')
  await fs.writeFile(path.join(docsDir, 'tidypress.config.ts'), configSource, 'utf8')
  return { root, docsDir }
}
