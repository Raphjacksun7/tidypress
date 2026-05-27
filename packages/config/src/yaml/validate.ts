import { tidyPressYamlSchema } from './schema-files.js'

export interface TidyPressYamlValidationIssue {
  path: string
  message: string
}

export interface TidyPressYamlValidationResult {
  ok: boolean
  issues: TidyPressYamlValidationIssue[]
}

function typeName(value: unknown): string {
  if (value === null) {
    return 'null'
  }
  if (Array.isArray(value)) {
    return 'array'
  }
  return typeof value
}

function validateNode(
  schema: Record<string, unknown>,
  value: unknown,
  path: string,
  issues: TidyPressYamlValidationIssue[],
): void {
  const expectedType = schema.type
  if (typeof expectedType === 'string') {
    const actual = typeName(value)
    const matches =
      expectedType === 'array'
        ? Array.isArray(value)
        : expectedType === actual || (expectedType === 'integer' && actual === 'number')
    if (!matches) {
      issues.push({
        path,
        message: `Expected ${expectedType}, received ${actual}.`,
      })
      return
    }
  }

  if (schema.enum && Array.isArray(schema.enum) && !schema.enum.includes(value)) {
    issues.push({
      path,
      message: `Value must be one of: ${schema.enum.map(String).join(', ')}.`,
    })
    return
  }

  if (typeof value === 'string' && schema.minLength && value.length < Number(schema.minLength)) {
    issues.push({
      path,
      message: `String must be at least ${schema.minLength} characters.`,
    })
  }

  if (schema.properties && typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const record = value as Record<string, unknown>
    const properties = schema.properties as Record<string, Record<string, unknown>>
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(record)) {
        if (!properties[key]) {
          issues.push({ path: path ? `${path}.${key}` : key, message: 'Unknown property.' })
        }
      }
    }
    for (const [key, childSchema] of Object.entries(properties)) {
      if (key in record) {
        validateNode(childSchema, record[key], path ? `${path}.${key}` : key, issues)
      }
    }
  }
}

/** Validate a parsed tidypress.yaml document against the shared JSON Schema. */
export function validateTidyPressYaml(value: unknown): TidyPressYamlValidationResult {
  const issues: TidyPressYamlValidationIssue[] = []
  validateNode(tidyPressYamlSchema, value, '', issues)
  return { ok: issues.length === 0, issues }
}
