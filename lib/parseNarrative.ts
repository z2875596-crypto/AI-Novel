import { NarrativeResponse } from '@/types/narrative'

export function parseNarrativeResponse(raw: string): NarrativeResponse {
  const fallback: NarrativeResponse = {
    narrative: raw,
    statusDelta: {},
    ending: null,
    clues: [],
    memoryHint: '',
  }

  try {
    const start = raw.indexOf('{')
    const end = raw.lastIndexOf('}')
    if (start === -1 || end === -1) return fallback

    const jsonStr = raw.slice(start, end + 1)
    const parsed = JSON.parse(jsonStr)

    return {
      narrative: typeof parsed.narrative === 'string'
        ? parsed.narrative
        : fallback.narrative,
      statusDelta: typeof parsed.statusDelta === 'object' && parsed.statusDelta !== null
        ? parsed.statusDelta
        : {},
      ending: parsed.ending && parsed.ending.type && parsed.ending.title
        ? parsed.ending
        : null,
      clues: Array.isArray(parsed.clues) ? parsed.clues : [],
      memoryHint: typeof parsed.memoryHint === 'string'
        ? parsed.memoryHint
        : '',
    }
  } catch {
    try {
      const narrativeMatch = raw.match(/"narrative"\s*:\s*"([\s\S]*?)"(?=\s*,|\s*})/)
      if (narrativeMatch) {
        return { ...fallback, narrative: narrativeMatch[1] }
      }
    } catch {}
    return fallback
  }
}
