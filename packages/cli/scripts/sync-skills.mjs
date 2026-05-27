import { cp, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const repoSkills = path.resolve(packageRoot, '../../skills')
const packageSkills = path.resolve(packageRoot, 'skills')

await rm(packageSkills, { recursive: true, force: true })
await cp(repoSkills, packageSkills, { recursive: true })
