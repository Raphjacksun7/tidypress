type PublishedEntry = {
  data: {
    published?: boolean
    scheduled?: Date
  }
}

export function onlyPublished<T extends PublishedEntry>(entries: T[]): T[] {
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
