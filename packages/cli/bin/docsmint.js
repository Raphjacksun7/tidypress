#!/usr/bin/env node
import { runCliMain } from '../src/index.js'

await runCliMain(process.argv.slice(2))
