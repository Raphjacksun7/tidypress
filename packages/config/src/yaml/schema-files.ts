import initPresetsJson from '../schemas/init-presets.json' with { type: 'json' }
import yamlSchemaJson from '../schemas/docsmint-yaml.schema.json' with { type: 'json' }

export interface DocsMintInitPresetDescriptor {
  name: string
  summary: string
}

export interface DocsMintInitPresetsFile {
  defaultPreset: string
  aliases: Record<string, string>
  presets: DocsMintInitPresetDescriptor[]
}

export const docsMintInitPresets = initPresetsJson as DocsMintInitPresetsFile

export const docsMintYamlSchema = yamlSchemaJson as Record<string, unknown>
