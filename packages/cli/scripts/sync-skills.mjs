import { cp, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const repoSkills = path.resolve(packageRoot, '../../skills')
const packageSkills = path.resolve(packageRoot, 'skills')

/** Repo skills/ is one level below root; bundled skills/ is three (packages/cli/skills). */
function adjustDocLinksForPackageBundle(content) {
  return content
    .replace(
      /\]\(\.\.\/\.\.\/(CONTRIBUTING\.md|README\.md|RELEASING\.md|LICENSE)\)/g,
      '](../../../$1)',
    )
    .replace(/\]\(\.\.\/(CONTRIBUTING\.md)/g, '](../../$1)')
}

await rm(packageSkills, { recursive: true, force: true })
await cp(repoSkills, packageSkills, { recursive: true })

for (const rel of ['tidypress-contributor/SKILL.md', 'README.md']) {
  const file = path.join(packageSkills, rel)
  const content = await readFile(file, 'utf8')
  await writeFile(file, adjustDocLinksForPackageBundle(content), 'utf8')
}
