import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const pkg = require('../../package.json')

/**
 * Maintainer-oriented release metadata checks.
 */
export class ReleaseCheckService {
  /**
   * @returns {{ version: string, name: string }}
   */
  run() {
    return {
      version: pkg.version,
      name: pkg.name,
    }
  }
}
