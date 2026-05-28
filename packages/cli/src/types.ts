import type { TidyPressConfig as Config } from '@tidypress/config'

export type CliLogFn = (message: string) => void

export type CliIo = {
  info: CliLogFn
  error?: CliLogFn
}

export type CliCommandName =
  | 'init'
  | 'migrate-sections'
  | 'dev'
  | 'build'
  | 'preview'
  | 'clean'
  | 'deploy'
  | 'domain'
  | 'skills'
  | 'import'
  | 'doctor'
  | 'release-check'
  | 'add-version'
  | 'editor'
  | 'export'
  | 'ai'

export type CommandHandler = { execute: (request: any) => Promise<void> }

export type CommandMap = Partial<Record<CliCommandName, CommandHandler>>

export type TidyPressConfig = Config

export type SnapshotConfig = {
  collections?: TidyPressConfig['collections']
  capabilities?: { enable?: string[]; disable?: string[] }
  experimental?: { editor?: boolean; export?: boolean; ai?: boolean }
}
