export type PublishFlags = {
  published?: boolean
  scheduled?: Date
}

export type PublishableEntry = {
  id: string
  data: Record<string, unknown> & PublishFlags
}

export function onlyPublished<T extends PublishableEntry>(entries: T[]): T[] {
  const now = Date.now()
  return entries.filter(entry => {
    if (entry.data.published === false) {
      return false
    }
    if (!entry.data.scheduled) {
      return true
    }
    return entry.data.scheduled.getTime() <= now
  })
}
