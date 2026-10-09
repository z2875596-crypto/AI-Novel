import { useGameStore } from '@/stores/gameStore'
import { useGenreStore } from '@/stores/genreStore'
import { useWorldStore } from '@/stores/worldStore'
import { useClueStore } from '@/stores/clueStore'
import { useRelationshipStore } from '@/stores/relationshipStore'
import { useMemoryStore } from '@/stores/memoryStore'
import { useSummaryStore } from '@/stores/summaryStore'
import { useStyleStore } from '@/stores/styleStore'
import { upsertSave, loadSaves } from '@/lib/saveManager'
import { STORY_LENGTH_CONFIG } from '@/types/world'
import type { SaveRecord } from '@/types/save'
import type { TurnSnapshot } from '@/types/session'

export function captureSnapshot(): TurnSnapshot {
  const g = useGameStore.getState()
  return structuredClone({ turn: g.turn, messageCount: g.messages.length, status: g.status,
    currentChoices: g.currentChoices, ending: g.ending, plotHint: g.plotHint,
    worldConfig: useWorldStore.getState().worldConfig, clues: useClueStore.getState().clues,
    relationships: useRelationshipStore.getState().relationships, memoryEvents: useMemoryStore.getState().events,
    summaries: useSummaryStore.getState().summaries, styleConfig: useStyleStore.getState().styleConfig,
    subplots: useGenreStore.getState().subplots })
}

export function restoreSnapshot(s: TurnSnapshot) {
  useWorldStore.getState().setWorldConfig(s.worldConfig)
  useClueStore.setState({ clues: s.clues })
  useRelationshipStore.setState({ relationships: s.relationships })
  useMemoryStore.setState({ events: s.memoryEvents })
  useSummaryStore.setState({ summaries: s.summaries })
  useStyleStore.setState({ styleConfig: s.styleConfig })
  useGenreStore.getState().setSubplots(s.subplots)
  useGameStore.setState({ turn: s.turn, status: s.status, currentChoices: s.currentChoices,
    ending: s.ending, plotHint: s.plotHint ?? '', isStreaming: false, streamingText: '' })
}

export function ensureSession() {
  const g = useGameStore.getState()
  if (!g.sessionId) useGameStore.setState({ sessionId: crypto.randomUUID(), storyId: crypto.randomUUID(), createdAt: Date.now() })
}

export function buildSaveRecord(name?: string): SaveRecord {
  ensureSession()
  const g = useGameStore.getState(), s = captureSnapshot(), genre = useGenreStore.getState().genre
  if (!genre) throw new Error('没有可保存的故事')
  const length = STORY_LENGTH_CONFIG[s.worldConfig.storyLength ?? 'medium']
  const existing = loadSaves().find(save => save.id === g.sessionId)
  return { schemaVersion: 2, id: name ? crypto.randomUUID() : g.sessionId, storyId: g.storyId,
    createdAt: name ? Date.now() : g.createdAt, updatedAt: Date.now(),
    storyTitle: name ?? existing?.storyTitle ?? `${s.worldConfig.worldName} · ${s.worldConfig.protagonistName}`,
    genre, chapter: Math.min(length.totalChapters, Math.max(1, Math.ceil(g.turn / length.turnsPerChapter))),
    turn: g.turn, worldConfig: s.worldConfig, statusSnapshot: g.status,
    recentHistory: g.messages, currentChoices: g.currentChoices, branchHistory: [],
    snapshot: s, checkpoints: g.checkpoints, summaries: s.summaries, ending: g.ending,
    parentId: g.parentId, isBranch: !!g.parentId, branchFromTurn: g.branchFromTurn, branchLabel: existing?.branchLabel }
}

export function restoreSave(save: SaveRecord) {
  useGenreStore.getState().setGenre(save.genre)
  useWorldStore.getState().setWorldConfig(save.worldConfig)
  resetAuxiliaryState()
  if (save.snapshot) restoreSnapshot(structuredClone(save.snapshot))
  else useSummaryStore.setState({ summaries: save.summaries ?? [] })
  // Never borrow data from the previously open story, even when turns coincide.
  const history = save.schemaVersion === 2 ? save.recentHistory :
    [...new Map([...(save.summaries ?? []).flatMap(s => s.messages), ...save.recentHistory].map(m => [m.id, m])).values()]
  useGameStore.setState({ sessionId: save.id, storyId: save.storyId ?? save.id,
    createdAt: save.createdAt, parentId: save.parentId, branchFromTurn: save.branchFromTurn,
    turn: save.turn, status: save.statusSnapshot, messages: structuredClone(history),
    currentChoices: save.currentChoices ?? [], checkpoints: structuredClone(save.checkpoints ?? []),
    ending: save.ending, isStreaming: false, activeRequestId: '', streamingText: '', plotHint: save.snapshot?.plotHint ?? '' })
}

export function resetAuxiliaryState() {
  useClueStore.getState().reset(); useRelationshipStore.getState().reset()
  useMemoryStore.getState().reset(); useSummaryStore.getState().reset()
  useStyleStore.getState().reset(); useGenreStore.getState().setSubplots([])
}

export function archiveCurrentStory() {
  if (useGameStore.getState().isStreaming) throw new Error('请等待当前回合完成')
  if (useGameStore.getState().messages.length && useGenreStore.getState().genre) upsertSave(buildSaveRecord())
}

export function rewindTo(turn: number) {
  const g = useGameStore.getState()
  if (g.isStreaming) throw new Error('请等待当前回合完成')
  const snapshot = g.checkpoints.find(s => s.turn === turn)
  if (!snapshot || turn >= g.turn) throw new Error('该节点没有完整快照，无法回溯')
  const original = buildSaveRecord()
  upsertSave(original)
  const id = crypto.randomUUID()
  const branch: SaveRecord = { ...original, id, createdAt: Date.now(), updatedAt: Date.now(),
    parentId: original.id, isBranch: true, branchFromTurn: turn, branchLabel: `分支·第${turn}回合`,
    storyTitle: `${snapshot.worldConfig.worldName} · 分支·第${turn}回合`,
    turn, worldConfig: snapshot.worldConfig, statusSnapshot: snapshot.status,
    recentHistory: original.recentHistory.slice(0, snapshot.messageCount), currentChoices: snapshot.currentChoices,
    snapshot, checkpoints: g.checkpoints.filter(s => s.turn <= turn), summaries: snapshot.summaries, ending: snapshot.ending,
    chapter: Math.max(1, Math.ceil(turn / STORY_LENGTH_CONFIG[snapshot.worldConfig.storyLength].turnsPerChapter)) }
  // Persist both before switching; quota failures leave the active story unchanged.
  upsertSave(branch)
  restoreSave(branch)
}
