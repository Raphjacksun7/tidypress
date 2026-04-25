type DocEntry = {
  id: string
  data: {
    order?: number
  }
}

function stripNumericPrefix(segment: string): string {
  return segment.replace(/^\d+[-_]?/, '')
}

function normalizedId(id: string): string {
  const parts = id.split('/')
  const last = parts.pop() ?? id
  return [...parts, stripNumericPrefix(last)].join('/')
}

export function sortDocs<T extends DocEntry>(entries: T[]): T[] {
  return [...entries].sort((a, b) => {
    const aOrder = a.data.order
    const bOrder = b.data.order

    if (aOrder !== undefined && bOrder !== undefined) {
      return aOrder - bOrder
    }
    if (aOrder !== undefined) {
      return -1
    }
    if (bOrder !== undefined) {
      return 1
    }

    const aName = normalizedId(a.id).toLowerCase()
    const bName = normalizedId(b.id).toLowerCase()
    return aName.localeCompare(bName)
  })
}
