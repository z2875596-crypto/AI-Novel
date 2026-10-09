'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGenreStore } from '@/stores/genreStore'
import { useWorldStore } from '@/stores/worldStore'
import { useGameStore } from '@/stores/gameStore'
import { useRelationshipStore } from '@/stores/relationshipStore'
import { GENRE_CONFIG } from '@/lib/themeConfig'
import { buildSaveRecord, ensureSession, rewindTo } from '@/lib/session'
import { upsertSave } from '@/lib/saveManager'
import { runStory, retryChoices, StoryGenerationError } from '@/lib/storyRunner'
import { exportNovelAsText, downloadText } from '@/lib/exportNovel'
import { stop } from '@/lib/tts'
import ThemeProvider from '@/components/shared/ThemeProvider'
import StoryPanel from '@/components/game/StoryPanel'
import ChoicesBar from '@/components/game/ChoicesBar'
import FreeInputBox from '@/components/game/FreeInputBox'
import StatusBar from '@/components/game/StatusBar'
import TTSToggle from '@/components/game/TTSToggle'
import BGMController from '@/components/game/BGMController'
import PlotHintInput from '@/components/game/PlotHintInput'
import StatusDeltaToast from '@/components/game/StatusDeltaToast'
import SaveMenu from '@/components/game/SaveAsModal'
import WorldConfigModal from '@/components/game/WorldConfigModal'
import StyleSwitchPanel from '@/components/game/StyleSwitchPanel'
import MoreMenu from '@/components/game/MoreMenu'
import RewindModal from '@/components/game/RewindModal'
import SupplyPanel from '@/components/game/SupplyPanel'

export default function GamePage() {
  const router = useRouter()
  const genre = useGenreStore(s => s.genre)
  const worldConfig = useWorldStore(s => s.worldConfig)
  const { isStreaming, ending, turn, currentChoices, checkpoints, messages } = useGameStore()
  const latestInteraction = messages.filter(m => m.role === 'narrator').at(-1)?.interaction
  const [lastDelta, setLastDelta] = useState<Record<string, number>>({})
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [showWorldConfig, setShowWorldConfig] = useState(false)
  const [showStylePanel, setShowStylePanel] = useState(false)
  const [showRewind, setShowRewind] = useState(false)
  const [participating, setParticipating] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [phase, setPhase] = useState('')
  const [error, setError] = useState('')
  const [warning, setWarning] = useState('')
  const [pending, setPending] = useState<{ action: string; opening: boolean; mode: 'action' | 'continue' } | null>(null)
  const request = useRef<AbortController | null>(null)
  const feedback = { phase: setPhase, warning: setWarning, delta: setLastDelta }

  useEffect(() => {
    const warn = () => setWarning('浏览器存储空间不足或被禁用，刷新可能丢失进度。请立即导出当前故事，并清理不需要的存档。')
    window.addEventListener('yuanxu-storage-error', warn)
    return () => window.removeEventListener('yuanxu-storage-error', warn)
  }, [])

  async function handleAction(action: string, opening = false, mode: 'action' | 'continue' = 'action') {
    if (request.current || useGameStore.getState().isStreaming || useGameStore.getState().ending) return
    const controller = new AbortController()
    request.current = controller
    setPending({ action, opening, mode })
    setError(''); setWarning('')
    try { await runStory(action, opening, controller.signal, feedback, mode); if (!controller.signal.aborted) setPending(null) }
    catch (error) { setError(controller.signal.aborted ? '生成已取消，进度未推进。可以重试刚才的行动。' : error instanceof StoryGenerationError ? error.message : '连接中断或等待超时，进度未推进。请重试刚才的行动。') }
    finally { if (request.current === controller) request.current = null }
  }

  async function handleRetryChoices() {
    if (request.current || useGameStore.getState().isStreaming) return
    const controller = new AbortController()
    request.current = controller
    setWarning('')
    try { await retryChoices(controller.signal, feedback) }
    catch { if (!controller.signal.aborted) setWarning('选项暂时不可用，可以重试或自由输入行动。') }
    finally { if (request.current === controller) request.current = null }
  }

  useEffect(() => {
    if (!genre || !worldConfig.worldName) { router.replace('/'); return }
    ensureSession()
    useRelationshipStore.getState().initFromNPCs(worldConfig.npcs)
    // Schedule once after Strict Mode's setup/cleanup replay.
    const timer = setTimeout(() => {
      const g = useGameStore.getState()
      if (g.turn === 0 && !g.messages.length) void handleAction(worldConfig.openingScene, true)
      else if (!g.ending && !g.currentChoices.length && g.messages.filter(m => m.role === 'narrator').at(-1)?.interaction !== 'reading') void handleRetryChoices()
    }, 0)
    return () => {
      clearTimeout(timer); request.current?.abort(); stop()
      useGameStore.setState({ isStreaming: false, activeRequestId: '', streamingText: '' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && (e.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName))) return
      if (e.ctrlKey || e.altKey || e.metaKey || isStreaming || ending || showRewind || showWorldConfig || showStylePanel) return
      const index = ['A', 'B', 'C', 'D'].indexOf(e.key.toUpperCase())
      if (index >= 0 && currentChoices[index]) { e.preventDefault(); void handleAction(currentChoices[index]) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  function handleRewind(rewindTurn: number) {
    try { rewindTo(rewindTurn); setShowRewind(false); setError(''); setWarning(''); setPending(null) }
    catch (e) { setWarning((e as Error).message) }
  }
  function save(name?: string) {
    if (isStreaming) { setWarning('请等待当前回合完成后保存。'); return }
    try { upsertSave(buildSaveRecord(name)); setWarning(''); setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 2000) }
    catch (e) { setWarning((e as Error).message) }
  }
  const handleQuickSave = () => save()
  const handleSaveAs = (name: string) => save(name)

  if (!genre || !worldConfig.worldName) return null

  const config = GENRE_CONFIG[genre]

  return (
    <ThemeProvider>
      <StatusDeltaToast delta={lastDelta} />

      {showWorldConfig && (
        <WorldConfigModal onClose={() => setShowWorldConfig(false)} />
      )}

      {showStylePanel && (
        <StyleSwitchPanel onClose={() => setShowStylePanel(false)} />
      )}

      {showRewind && (
        <RewindModal
          messages={useGameStore.getState().messages}
          currentTurn={turn}
          availableTurns={checkpoints.map(s => s.turn)}
          onRewind={handleRewind}
          onClose={() => setShowRewind(false)}
        />
      )}

      {saveSuccess && (
        <div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-sm font-bold animate-fade-in-up"
          style={{
            background: 'rgba(91,173,94,0.2)',
            border: '1px solid rgba(91,173,94,0.6)',
            color: '#5BAD5E',
            boxShadow: '0 0 20px rgba(91,173,94,0.3)',
          }}
        >
          ✓ 存档已保存
        </div>
      )}

      <main
        className="h-dvh flex flex-col px-4 py-4 max-w-2xl mx-auto gap-3"
        style={{ color: config.theme.text }}
      >
        <div className="flex items-center justify-between flex-shrink-0">
          {/* 左：返回 + 更多菜单 */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all hover:brightness-110 active:scale-95"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: config.theme.textMuted,
                border: `1px solid ${config.theme.border}`,
              }}
            >
              ← 主页
            </button>
            <MoreMenu
              onWorldConfig={() => { if (!isStreaming) setShowWorldConfig(true) }}
              onStylePanel={() => { if (!isStreaming) setShowStylePanel(true) }}
              onChapters={() => router.push('/chapters')}
              onRelationships={() => router.push('/relationships')}
              onClues={() => router.push('/clues')}
              onRewind={() => { if (!isStreaming) setShowRewind(true) }}
            />
          </div>

          {/* 中：世界名 */}
          <div className="flex items-center gap-2">
            <span className="text-base">{config.emoji}</span>
            <span className="text-sm font-semibold" style={{ color: config.theme.primary }}>
              {worldConfig.worldName}
            </span>
          </div>

          {/* 右：存档 */}
          <SaveMenu
            onQuickSave={handleQuickSave}
            onSaveAs={handleSaveAs}
            onViewSaves={() => router.push('/saves')}
          />
        </div>

        <div className="flex-shrink-0">
          {worldConfig.supply ? <SupplyPanel onAction={action => { void handleAction(action) }} /> : <>
            <div className="flex justify-between text-xs" style={{ color: config.theme.textMuted }}><span>小说阅读</span><button aria-expanded={showDetails} onClick={() => setShowDetails(!showDetails)}>人物状态 {showDetails ? '收起' : '展开'}</button></div>
            {showDetails && <StatusBar />}
          </>}
        </div>

        <StoryPanel />

        {phase && <div role="status" className="text-xs flex items-center justify-between"><span>{phase}</span><button className="underline p-2" onClick={() => request.current?.abort()}>停止等待</button></div>}
        {error && <div role="alert" className="text-sm rounded-lg border p-3">{error}{pending && <p className="text-xs mt-1">待重试：{pending.action.slice(0, 100)}</p>}<button disabled={isStreaming} className="underline p-2" onClick={() => { if (pending) void handleAction(pending.action, pending.opening, pending.mode) }}>重试本次行动</button></div>}
        {warning && <div role="alert" className="text-xs rounded-lg border p-2">{warning}<button disabled={isStreaming} className="underline ml-2" onClick={() => downloadText(JSON.stringify(buildSaveRecord(), null, 2), worldConfig.worldName + '-backup.json')}>导出当前进度备份</button></div>}
        {ending ? <section className="rounded-xl border p-4 space-y-2" aria-label="故事结局"><h2 className="font-bold">故事已完结 · {ending.title}</h2><p className="text-xs">共完成 {turn} 回合。你可以导出故事，或回溯探索其他选择。</p><div className="flex gap-4 text-sm"><button disabled={isStreaming} onClick={() => downloadText(exportNovelAsText(buildSaveRecord()), worldConfig.worldName + '.txt')}>导出全文</button><button disabled={isStreaming} onClick={() => setShowRewind(true)}>回溯分支</button><button onClick={() => router.push('/')}>开始新故事</button></div></section> :
        <div className="flex-shrink-0 space-y-2">
          {!isStreaming && turn > 0 && !currentChoices.length && latestInteraction !== 'reading' && <button className="text-sm underline" onClick={handleRetryChoices}>重新生成行动选项</button>}
          <ChoicesBar onChoice={(c) => handleAction(c)} />
          {!worldConfig.supply && <div className="flex items-center justify-between gap-3">
            <button disabled={isStreaming || turn === 0} className="rounded-xl px-4 py-2 text-sm disabled:opacity-40" style={{ background: config.theme.primary, color: '#fff' }} onClick={() => handleAction('继续阅读，让故事自然向前发展。', false, 'continue')}>{latestInteraction === 'choice' || currentChoices.length ? '交给故事发展' : '继续阅读'}</button>
            <button disabled={isStreaming} aria-expanded={participating} className="text-sm px-3 py-2" onClick={() => setParticipating(!participating)}>{participating ? '收起参与' : '参与故事'}</button>
          </div>}
          {(worldConfig.supply || participating) && <div className="space-y-2 max-h-[35dvh] overflow-y-auto">
            <p className="text-xs">{worldConfig.supply ? '角色行动：说出你想做的事。' : '角色行动：说出你想做的事；剧情构想：提出希望故事如何发展。'}</p>
            <div className="flex-1">
              <FreeInputBox onSubmit={(t) => handleAction(t)} />
            </div>
            {!worldConfig.supply && <PlotHintInput />}
          </div>}
          <div className="flex justify-end gap-2"><BGMController /><TTSToggle /></div>
        </div>}
      </main>
    </ThemeProvider>
  )
}
