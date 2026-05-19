import { GenreKey } from '@/types/genre'
import { GENRE_CONFIG } from './themeConfig'

export function getInitialStatus(genre: GenreKey): Record<string, number> {
  const bars = GENRE_CONFIG[genre].bars
  const status: Record<string, number> = {}
  for (const bar of bars) {
    if (bar.key === 'money') status[bar.key] = 500
    else if (bar.key === 'realm') status[bar.key] = 1
    else if (bar.key === 'clues') status[bar.key] = 0
    else status[bar.key] = 50
  }
  return status
}

export function applyStatusDelta(
  genre: GenreKey,
  current: Record<string, number>,
  delta: Record<string, number>
): Record<string, number> {
  const bars = GENRE_CONFIG[genre].bars
  const next = { ...current }
  for (const bar of bars) {
    const d = delta[bar.key] ?? 0
    next[bar.key] = Math.min(bar.max, Math.max(0, (next[bar.key] ?? 0) + d))
  }
  return next
}

export function parseStatusDelta(text: string): {
  cleanText: string
  delta: Record<string, number>
} {
  const match = text.match(/\[STATUS_DELTA\](\{[^}]+\})\s*$/)
  console.log('STATUS_DELTA match:', match?.[0] ?? '未找到', '| 末尾100字:', text.slice(-100))
  if (!match) return { cleanText: text, delta: {} }
  try {
    const delta = JSON.parse(match[1]) as Record<string, number>
    const cleanText = text.slice(0, match.index).trimEnd()
    return { cleanText, delta }
  } catch {
    return { cleanText: text, delta: {} }
  }
}