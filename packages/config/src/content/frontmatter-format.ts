type FrontmatterScalar = string | number | boolean

type FrontmatterFieldFormat = 'scalar' | 'string-array' | 'iso-date'

export interface FrontmatterFieldDefinition<K extends string = string> {
  key: K
  format: FrontmatterFieldFormat
  optional?: boolean
  defaultValue?: FrontmatterScalar
}

function yamlScalar(value: string): string {
  if (/^[\w\s.,!?'"()-]+$/.test(value) && !value.includes(':')) {
    return value
  }
  return JSON.stringify(value)
}

function formatFrontmatterValue(format: FrontmatterFieldFormat, value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined
  }
  switch (format) {
    case 'scalar':
      return yamlScalar(String(value))
    case 'string-array':
      if (!Array.isArray(value) || value.length === 0) {
        return undefined
      }
      return `[${value.map(item => JSON.stringify(String(item))).join(', ')}]`
    case 'iso-date':
      return value instanceof Date ? value.toISOString() : String(value)
    default:
      return yamlScalar(String(value))
  }
}

export function formatFrontmatterBlock(
  fields: readonly FrontmatterFieldDefinition[],
  data: Record<string, unknown>,
): string {
  const lines: string[] = []
  for (const field of fields) {
    const raw = data[field.key]
    const value =
      raw === undefined && field.defaultValue !== undefined ? field.defaultValue : raw
    if (value === undefined && field.optional) {
      continue
    }
    const formatted = formatFrontmatterValue(field.format, value)
    if (formatted === undefined) {
      continue
    }
    lines.push(`${field.key}: ${formatted}`)
  }
  return lines.join('\n')
}
