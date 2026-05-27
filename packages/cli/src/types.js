/**
 * Shared JSDoc types for the tidypress CLI (checkJs).
 *
 * @typedef {(message: string) => void} CliLogFn
 * @typedef {{ info: CliLogFn, error?: CliLogFn }} CliIo
 *
 * @typedef {(
 *   | 'init'
 *   | 'migrate-sections'
 *   | 'dev'
 *   | 'build'
 *   | 'preview'
 *   | 'clean'
 *   | 'deploy'
 *   | 'domain'
 *   | 'context'
 *   | 'skills'
 *   | 'import'
 *   | 'doctor'
 *   | 'release-check'
 *   | 'add-version'
 *   | 'editor'
 *   | 'export'
 *   | 'ai'
 * )} CliCommandName
 *
 * @typedef {{ execute: (request: any) => Promise<void> }} CommandHandler
 *
 * @typedef {Partial<Record<CliCommandName, CommandHandler>>} CommandMap
 *
 * @typedef {import('@tidypress/config').TidyPressConfig} TidyPressConfig
 *
 * @typedef {{
 *   collections?: import('@tidypress/config').TidyPressConfig['collections']
 *   capabilities?: { enable?: string[], disable?: string[] }
 *   experimental?: { editor?: boolean, export?: boolean, ai?: boolean }
 * }} SnapshotConfig
 */

export {}
