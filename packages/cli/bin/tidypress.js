#!/usr/bin/env node
import { runCliMain } from '../dist/runCli.js'

await runCliMain(process.argv.slice(2))
