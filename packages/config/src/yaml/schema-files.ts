import initPresetsJson from '../schemas/init-presets.json' with { type: 'json' }
import yamlSchemaJson from '../schemas/tidypress-yaml.schema.json' with { type: 'json' }

export interface TidyPressInitPresetDescriptor {
  name: string
  summary: string
}

export interface TidyPressInitPresetsFile {
  defaultPreset: string
  aliases: Record<string, string>
  presets: TidyPressInitPresetDescriptor[]
}

export const tidyPressInitPresets = initPresetsJson as TidyPressInitPresetsFile

export const tidyPressYamlSchema = yamlSchemaJson as Record<string, unknown>
