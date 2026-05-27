import { tidyPressCodeThemePresets, type TidyPressCodeThemePreset } from '../schema/index.js'

export interface TidyPressCodeThemeDescriptor {
  preset: TidyPressCodeThemePreset
  label: string
  shikiTheme: string
}

export const tidyPressCodeThemeRegistry: Record<TidyPressCodeThemePreset, TidyPressCodeThemeDescriptor> = {
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

export function resolveCodeThemePreset(preset: TidyPressCodeThemePreset): TidyPressCodeThemeDescriptor {
  return tidyPressCodeThemeRegistry[preset]
}

export function isTidyPressCodeThemePreset(value: string): value is TidyPressCodeThemePreset {
  return tidyPressCodeThemePresets.includes(value as TidyPressCodeThemePreset)
}
