/**
 * @param {string | undefined} tagName
 * @returns {string}
 */
export function parseReleaseTagVersion(tagName) {
  if (!tagName || !/^v\d+\.\d+\.\d+$/.test(tagName)) {
    throw new Error(
      `Release tag must match v<major>.<minor>.<patch> (received "${tagName ?? ''}").`,
    )
  }

  return tagName.slice(1)
}

/**
 * @param {string} pyprojectToml
 * @returns {string}
 */
export function readPythonProjectVersion(pyprojectToml) {
  const match = pyprojectToml.match(/^\s*version\s*=\s*["']([^"']+)["']\s*$/m)
  if (!match?.[1]) {
    throw new Error('Unable to locate [project].version in wrappers/python/pyproject.toml.')
  }
  return match[1]
}

/**
 * @param {{
 *   tagName: string | undefined,
 *   cliVersion: string,
 *   configVersion: string,
 *   engineVersion: string,
 *   pythonVersion: string,
 * }} versions
 * @returns {{ releaseVersion: string, cliVersion: string, configVersion: string, engineVersion: string, pythonVersion: string }}
 */
export function assertReleaseVersionAlignment({
  tagName,
  cliVersion,
  configVersion,
  engineVersion,
  pythonVersion,
}) {
  const releaseVersion = parseReleaseTagVersion(tagName)

  const mismatches = [
    cliVersion !== releaseVersion && `cli=${cliVersion}`,
    configVersion !== releaseVersion && `config=${configVersion}`,
    engineVersion !== releaseVersion && `engine=${engineVersion}`,
    pythonVersion !== releaseVersion && `python=${pythonVersion}`,
  ].filter(Boolean)

  if (mismatches.length > 0) {
    throw new Error(
      `Version mismatch for ${tagName}: ${mismatches.join(', ')}. ` +
        `Update all four package versions before tagging.`,
    )
  }

  return { releaseVersion, cliVersion, configVersion, engineVersion, pythonVersion }
}
