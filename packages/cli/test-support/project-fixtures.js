import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

/**
 * Create a temporary docs project fixture with config and content roots.
 *
 * @param {{ configSource: string }} options
 * @returns {Promise<{ root: string, docsDir: string }>}
 */
export async function createDocsProjectFixture({ configSource }) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'docsmint-config-loader-'))
  const docsDir = path.join(root, 'docs')
  await fs.mkdir(path.join(docsDir, 'src/content/docs'), { recursive: true })
  await fs.mkdir(path.join(docsDir, 'src/content/writing'), { recursive: true })
  await fs.writeFile(path.join(docsDir, 'src/content/docs/getting-started.md'), '# docs', 'utf8')
  await fs.writeFile(path.join(docsDir, 'src/content/writing/hello.md'), '# writing', 'utf8')
  await fs.writeFile(path.join(docsDir, 'docsmint.config.ts'), configSource, 'utf8')
  return { root, docsDir }
}
