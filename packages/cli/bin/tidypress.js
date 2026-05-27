#!/usr/bin/env node
import { runCliMain } from '../dist/index.js'

await runCliMain(process.argv.slice(2))
