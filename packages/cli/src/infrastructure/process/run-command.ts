import { spawn } from 'node:child_process'

/**
 * @param {{command: string, args: string[], cwd: string, env?: Record<string, string>}} options
 * @returns {Promise<void>}
 */
export async function runCommand({ command, args, cwd, env }) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: env ? { ...process.env, ...env } : process.env,
    })

    child.on('exit', code => {
      if (code === 0) {
        resolve(undefined)
      } else {
        reject(new Error(`${command} ${args.join(' ')} failed with code ${code ?? 'unknown'}`))
      }
    })

    child.on('error', reject)
  })
}
