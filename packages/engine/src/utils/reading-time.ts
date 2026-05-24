const WORDS_PER_MINUTE = 200

export function estimateReadingTimeMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  if (words === 0) {
    return 1
  }
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}

export function formatReadingTimeLabel(minutes: number): string {
  return `${minutes} min read`
}
