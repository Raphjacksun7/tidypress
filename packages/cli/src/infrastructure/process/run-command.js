import { spawn } from 'node:child_process'

/**
 * @param {{command: string, args: string[], cwd: string}} options
 * @returns {Promise<void>}
 */
export async function runCommand({ command, args, cwd }) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32',
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
