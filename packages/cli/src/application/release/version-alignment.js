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
 * @param {{ tagName: string | undefined, cliVersion: string, pythonVersion: string }} versions
 * @returns {{ releaseVersion: string, cliVersion: string, pythonVersion: string }}
 */
export function assertReleaseVersionAlignment({ tagName, cliVersion, pythonVersion }) {
  const releaseVersion = parseReleaseTagVersion(tagName)
  if (cliVersion !== releaseVersion || pythonVersion !== releaseVersion) {
    throw new Error(
      `Version mismatch for ${tagName}: cli=${cliVersion}, python=${pythonVersion}. Update both package versions before tagging.`,
    )
  }

  return { releaseVersion, cliVersion, pythonVersion }
}
