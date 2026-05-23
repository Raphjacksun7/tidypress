import { docsMintCodeThemePresets, type DocsMintCodeThemePreset } from '../schema/index.js'

export interface DocsMintCodeThemeDescriptor {
  preset: DocsMintCodeThemePreset
  label: string
  shikiTheme: string
}

export const docsMintCodeThemeRegistry: Record<DocsMintCodeThemePreset, DocsMintCodeThemeDescriptor> = {
  claude: {
    preset: 'claude',
    label: 'Claude (balanced dark)',
    shikiTheme: 'one-dark-pro',
  },
  jetbrains: {
    preset: 'jetbrains',
    label: 'JetBrains (vibrant dark)',
    shikiTheme: 'material-theme-palenight',
  },
  github: {
    preset: 'github',
    label: 'GitHub Dark',
    shikiTheme: 'github-dark',
  },
  dracula: {
    preset: 'dracula',
    label: 'Dracula',
    shikiTheme: 'dracula',
  },
  material: {
    preset: 'material',
    label: 'Material Theme',
    shikiTheme: 'material-theme',
  },
  nord: {
    preset: 'nord',
    label: 'Nord',
    shikiTheme: 'nord',
  },
}

export function resolveCodeThemePreset(preset: DocsMintCodeThemePreset): DocsMintCodeThemeDescriptor {
  return docsMintCodeThemeRegistry[preset]
}

export function isDocsMintCodeThemePreset(value: string): value is DocsMintCodeThemePreset {
  return docsMintCodeThemePresets.includes(value as DocsMintCodeThemePreset)
}
