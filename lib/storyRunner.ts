import { useGameStore } from '@/stores/gameStore'
import { useGenreStore } from '@/stores/genreStore'
import { useWorldStore } from '@/stores/worldStore'
import { useStyleStore } from '@/stores/styleStore'
import { useSummaryStore } from '@/stores/summaryStore'
import { useClueStore } from '@/stores/clueStore'
import { useMemoryStore } from '@/stores/memoryStore'
import { useRelationshipStore, type RelationshipUpdate } from '@/stores/relationshipStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { buildSaveRecord, captureSnapshot, ensureSession } from './session'
import { upsertSave } from './saveManager'
import { applyStatusDelta } from './statusBar'
import { sanitizePlayerInput } from './sanitizeInput'
import { validateNarrative } from './storyProtocol'
import { speak, stop } from './tts'
import { STORY_LENGTH_CONFIG } from '@/types/world'
import type { NarrativeResponse } from '@/types/narrative'
import type { Message } from '@/types/game'
import type { Clue } from '@/types/clue'
import { supplyChoices } from './supplyGame'

export type RunFeedback = { phase: (text: string) => void; warning: (text: string) => void; delta: (delta: Record<string, number>) => void }
export class StoryGenerationError extends Error {}

async function jsonRequest(url: string, body: unknown, signal: AbortSignal, timeout = 20000) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body), signal: AbortSignal.any([signal, AbortSignal.timeout(timeout)]) })
  if (!res.ok) throw new Error('请求未完成，请稍后重试')
  return res.json()
}

export function saveCheckpoint(feedback: RunFeedback) {
  const g = useGameStore.getState()
  const checkpoint = captureSnapshot()
  useGameStore.setState({ checkpoints: [...g.checkpoints.filter(s => s.turn !== g.turn), checkpoint] })
  try { upsertSave(buildSaveRecord()) } catch (e) { feedback.warning((e as Error).message) }
}

async function generateChoices(signal: AbortSignal) {
  const g = useGameStore.getState(), wc = useWorldStore.getState().worldConfig
  const lastNarrator = g.messages.filter(m => m.role === 'narrator').at(-1)
  if (!lastNarrator || g.ending) return []
  if (wc.supply) return supplyChoices(wc.supply)
  if (lastNarrator.interaction === 'reading') return []
  const data = await jsonRequest('/api/story/choices', { genre: useGenreStore.getState().genre,
    lastNarratorText: lastNarrator.content, status: g.status, turn: g.turn,
    protagonistName: wc.protagonistName, narrativePOV: wc.narrativePOV,
    recentChoices: g.messages.filter(m => m.role === 'player').slice(-5).map(m => m.content) }, signal)
  if (!Array.isArray(data.choices) || !data.choices.length || data.choices.some((c: unknown) => typeof c !== 'string' || !c.trim())) {
    throw new Error('选项生成失败，可重新生成选项或自由输入行动')
  }
  return data.choices.slice(0, 4) as string[]
}

export async function retryChoices(signal: AbortSignal, feedback: RunFeedback) {
  const g = useGameStore.getState()
  if (g.isStreaming || g.ending) return
  const id = g.sessionId, turn = g.turn, requestId = crypto.randomUUID()
  const active = () => !signal.aborted && useGameStore.getState().sessionId === id && useGameStore.getState().turn === turn && useGameStore.getState().activeRequestId === requestId
  useGameStore.setState({ isStreaming: true, activeRequestId: requestId })
  feedback.phase('正在生成行动选项…')
  try {
    const choices = await generateChoices(signal)
    if (active()) { useGameStore.setState({ currentChoices: choices }); saveCheckpoint(feedback) }
  } finally {
    if (useGameStore.getState().activeRequestId === requestId) useGameStore.setState({ isStreaming: false, activeRequestId: '' })
    feedback.phase('')
  }
}

export async function runStory(action: string, opening: boolean, signal: AbortSignal, feedback: RunFeedback, mode: 'action' | 'continue' = 'action') {
  ensureSession()
  const before = useGameStore.getState()
  if (before.isStreaming || before.ending) return
  const { safe, blocked } = sanitizePlayerInput(action)
  if (blocked || !safe.trim()) throw new Error('请描述角色在故事中的行动，再试一次。')
  const { genre, subplots } = useGenreStore.getState()
  if (!genre) return
  const world = useWorldStore.getState().worldConfig
  const requestId = crypto.randomUUID()
  const active = () => !signal.aborted && useGameStore.getState().sessionId === before.sessionId && useGameStore.getState().activeRequestId === requestId
  stop()
  useGameStore.setState({ isStreaming: true, streamingText: '', activeRequestId: requestId })
  feedback.phase('正在生成故事，通常需要一些时间…')
  let committed = false
  try {
    const response = await fetch('/api/story/stream', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.any([signal, AbortSignal.timeout(95000)]),
      body: JSON.stringify({ genre, worldConfig: world, history: before.messages.slice(-10), action: safe, opening, inputMode: mode,
        delegateDecision: mode === 'continue' && (before.messages.filter(m => m.role === 'narrator').at(-1)?.interaction === 'choice' || before.currentChoices.length > 0),
        playerAction: (useSummaryStore.getState().summaries.length ? '【历史摘要】\n' + useSummaryStore.getState().summaries.map(s => s.content).join('\n') + '\n' : '') + safe,
        status: before.status, turn: before.turn + 1, styleConfig: useStyleStore.getState().styleConfig,
        plotHint: before.plotHint, subplots, memoryEvents: useMemoryStore.getState().getHighImportanceEvents(),
        storyLength: world.storyLength }) })
    if (!response.ok || !response.body) throw new Error('故事服务暂时不可用，请重试')
    const reader = response.body.getReader(), decoder = new TextDecoder()
    let buffer = '', result: NarrativeResponse | undefined
    const consume = (line: string) => {
      if (!line.trim()) return
      const event = JSON.parse(line)
      if (event.type === 'error') throw new StoryGenerationError(typeof event.message === 'string' ? event.message : '生成未完成，进度未改变。')
      if (event.type === 'retry' && active()) {
        useGameStore.setState({ streamingText: '' })
        feedback.phase('本次生成中断，正在自动重试（1/1）…')
      }
      if (event.type === 'preview' && active()) useGameStore.setState({ streamingText: event.text })
      if (event.type === 'complete') {
        if (result) throw new Error('故事响应重复，请重试')
        result = validateNarrative(event.data)
      }
    }
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        let newline: number
        while ((newline = buffer.indexOf('\n')) >= 0) { consume(buffer.slice(0, newline)); buffer = buffer.slice(newline + 1) }
      }
      buffer += decoder.decode(); consume(buffer)
    } finally { await reader.cancel().catch(() => {}); reader.releaseLock() }
    if (!active()) return
    if (!result) throw new Error('连接中断，未收到完整故事；请重试')
    const data = result as NarrativeResponse, turn = before.turn + 1, now = Date.now()
    if (world.supply && !data.supply) throw new Error('缺少完整行动裁定，进度未改变')
    const status = applyStatusDelta(genre, before.status, data.statusDelta)
    const appliedDelta = Object.fromEntries(Object.keys(status)
      .map(key => [key, status[key] - (before.status[key] ?? 0)] as const)
      .filter(([, change]) => change !== 0))
    const messages: Message[] = [...before.messages,
      ...(!opening && mode !== 'continue' ? [{ id: crypto.randomUUID(), role: 'player' as const, content: safe, turn, timestamp: now }] : []),
      { id: crypto.randomUUID(), role: 'narrator', content: data.narrative, turn, timestamp: now, statusDelta: appliedDelta, interaction: data.interaction }]
    useGameStore.setState({ turn, status, messages, currentChoices: [], streamingText: '', plotHint: before.plotHint,
      ending: data.ending ? { ...data.ending, unlockedAt: now } : undefined })
    if (data.supply) useWorldStore.getState().updateField('supply', data.supply)
    committed = true
    data.clues.forEach(c => useClueStore.getState().addClue({ ...c,
      category: c.category as Clue['category'], importance: c.importance as Clue['importance'], foundAt: turn, timestamp: now, revealed: !!c.revelation }))
    if (data.memoryHint) useMemoryStore.getState().addEvent({ id: crypto.randomUUID(), turn,
      type: 'player_action', subject: '本回合', description: data.memoryHint, importance: 'medium' })
    useWorldStore.getState().updateField('plotBeats', (world.plotBeats ?? []).map(b => b.triggerTurn <= turn ? { ...b, triggered: true } : b))
    feedback.delta(appliedDelta)
    saveCheckpoint(feedback)
    const settings = useSettingsStore.getState()
    if (settings.ttsEnabled) speak(data.narrative, { rate: settings.ttsRate, pitch: settings.ttsPitch, volume: settings.ttsVolume })
    feedback.phase(data.ending ? '正在整理结局…' : '故事已生成，正在保存阅读进度…')
    const tpc = STORY_LENGTH_CONFIG[world.storyLength ?? 'medium'].turnsPerChapter
    // All secondary writes are guarded and finish before the next action is enabled.
    await Promise.allSettled([
      (async () => {
        if (data.ending) return
        try { const choices = await generateChoices(signal); if (active()) useGameStore.setState({ currentChoices: choices }) }
        catch { if (active()) feedback.warning('故事已保存，但选项生成失败。可重新生成选项或自由输入行动。') }
      })(),
      (async () => {
        if (turn % tpc) return
        const chapterNumber = Math.ceil(turn / tpc)
        const out = await jsonRequest('/api/summary', { genre, history: messages.filter(m => (m.turn ?? 0) > turn - tpc), chapterNumber }, signal, 15000)
        if (active() && typeof out.summary === 'string' && out.summary.trim()) useSummaryStore.getState().addSummary({
          id: crypto.randomUUID(), gameId: before.storyId, triggerTurn: turn, chapterNumber,
          chapterTitle: out.chapterTitle || `第${chapterNumber}章`, content: out.summary, statusAtTrigger: status,
          messages: messages.filter(m => (m.turn ?? 0) > turn - tpc) })
      })(),
      (async () => {
        if (!world.npcs.length || world.supply) return
        const out = await jsonRequest('/api/relationship', { narratorText: data.narrative, npcs: world.npcs, protagonistName: world.protagonistName, turn }, signal, 15000)
        if (active() && Array.isArray(out.updates)) out.updates.forEach((u: RelationshipUpdate) => {
          if (typeof u.npcId === 'string' && typeof u.npcName === 'string' && typeof u.eventDescription === 'string' && Number.isFinite(u.affinityDelta))
            useRelationshipStore.getState().applyUpdate({ ...u, turn })
        })
      })(),
      (async () => {
        if (turn % 5) return
        const out = await jsonRequest('/api/memory/extract', { recentMessages: messages.slice(-10), turn }, signal, 15000)
        if (active() && Array.isArray(out.events)) out.events.forEach((event: import('@/stores/memoryStore').MemoryEvent) => {
          if (['npc_relation', 'world_change', 'player_action', 'secret_revealed', 'item_obtained'].includes(event.type) &&
            ['low', 'medium', 'high'].includes(event.importance) && typeof event.subject === 'string' && typeof event.description === 'string') {
            useMemoryStore.getState().addEvent({ ...event, id: crypto.randomUUID(), turn })
          }
        })
      })(),
    ])
    if (active()) saveCheckpoint(feedback)
  } catch (error) {
    if (!committed) throw error
    if (active()) feedback.warning('本回合已完成，辅助信息暂未更新；请检查存档状态。')
  } finally {
    if (useGameStore.getState().activeRequestId === requestId) useGameStore.setState({ isStreaming: false, streamingText: '', activeRequestId: '' })
    feedback.phase('')
  }
}
