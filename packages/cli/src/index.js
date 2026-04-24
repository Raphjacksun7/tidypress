import process from 'node:process'

import { createApplication } from './bootstrap/createApplication.js'

/**
 * @param {string[]} args
 */
export async function runCli(args) {
  const app = createApplication({
    version: '0.1.0',
    projectRoot: process.cwd(),
    io: {
      info(message) {
        console.log(message)
      },
      error(message) {
        console.error(message)
      },
    },
  })
  await app.run(args)
}
