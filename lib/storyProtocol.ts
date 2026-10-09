import type { NarrativeResponse } from '../types/narrative'
import { validateSupply } from './supplyGame'

/** Invalid / truncated model output must never become a completed turn. */
export function validateNarrative(value: unknown): NarrativeResponse {
  if (!value || typeof value !== 'object') throw new Error('故事响应格式不完整，请重试')
  const v = value as Record<string, unknown>
  if (typeof v.narrative !== 'string' || !v.narrative.trim()) throw new Error('没有收到完整故事，请重试')
  if (v.interaction !== undefined && (typeof v.interaction !== 'string' || !['reading', 'choice'].includes(v.interaction))) throw new Error('阅读情境格式异常，请重试')
  const delta = v.statusDelta
  if (!delta || typeof delta !== 'object' || Array.isArray(delta) ||
    Object.values(delta).some(n => typeof n !== 'number' || !Number.isFinite(n))) {
    throw new Error('故事状态格式异常，请重试')
  }
  if (v.ending !== null && v.ending !== undefined) {
    const e = v.ending as Record<string, unknown>
    if (!['good', 'bad', 'true', 'secret'].includes(String(e.type)) || typeof e.title !== 'string' || !e.title.trim()) {
      throw new Error('结局格式异常，请重试')
    }
  }
  const clues = Array.isArray(v.clues) ? v.clues.filter(c => c &&
    typeof c.id === 'string' && typeof c.name === 'string' && typeof c.description === 'string' &&
    ['person', 'object', 'location', 'event', 'other'].includes(c.category) &&
    ['low', 'medium', 'high'].includes(c.importance) && Array.isArray(c.relatedClues) &&
    c.relatedClues.every((id: unknown) => typeof id === 'string')) : []
  return { interaction: v.interaction as NarrativeResponse['interaction'], supply: v.supply === undefined ? undefined : validateSupply(v.supply), narrative: v.narrative.trim(), statusDelta: delta as Record<string, number>,
    ending: (v.ending ?? null) as NarrativeResponse['ending'], clues,
    memoryHint: typeof v.memoryHint === 'string' ? v.memoryHint : '' }
}

export function parseCompleteNarrative(raw: string): NarrativeResponse {
  const text = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  return validateNarrative(JSON.parse(text))
}

/** Extract only the narrative field for preview; never display raw JSON. */
export function narrativePreview(raw: string): string {
  const match = /"narrative"\s*:\s*"/.exec(raw)
  if (!match) return ''
  let text = ''
  for (let i = match.index + match[0].length; i < raw.length; i++) {
    const c = raw[i]
    if (c === '"') break
    if (c !== '\\') { text += c; continue }
    const next = raw[++i]
    if (!next) break
    if (next === 'u') {
      const hex = raw.slice(i + 1, i + 5)
      if (!/^[0-9a-f]{4}$/i.test(hex)) break
      text += String.fromCharCode(parseInt(hex, 16)); i += 4
    } else text += ({ n: '\n', r: '\r', t: '\t', '"': '"', '\\': '\\', '/': '/' } as Record<string, string>)[next] ?? ''
  }
  return text
}
