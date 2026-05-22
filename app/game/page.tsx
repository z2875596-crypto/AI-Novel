'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGenreStore } from '@/stores/genreStore'
import { useWorldStore } from '@/stores/worldStore'
import { useGameStore } from '@/stores/gameStore'
import { useSaveStore } from '@/stores/saveStore'
import { useSummaryStore } from '@/stores/summaryStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useStyleStore } from '@/stores/styleStore'
import { useClueStore } from '@/stores/clueStore'
import { GENRE_CONFIG } from '@/lib/themeConfig'
import { parseStatusDelta, applyStatusDelta } from '@/lib/statusBar'
import { parseClues } from '@/lib/prompts/cluePrompt'
import { speak, stop } from '@/lib/tts'
import { Message } from '@/types/game'
import { SaveRecord } from '@/types/save'
import ThemeProvider from '@/components/shared/ThemeProvider'
import StoryPanel from '@/components/game/StoryPanel'
import ChoicesBar from '@/components/game/ChoicesBar'
import FreeInputBox from '@/components/game/FreeInputBox'
import StatusBar from '@/components/game/StatusBar'
import TTSToggle from '@/components/game/TTSToggle'
import BGMController from '@/components/game/BGMController'
import StatusDeltaToast from '@/components/game/StatusDeltaToast'
import SaveMenu from '@/components/game/SaveAsModal'
import WorldConfigModal from '@/components/game/WorldConfigModal'
import StyleSwitchPanel from '@/components/game/StyleSwitchPanel'
import { useRelationshipStore } from '@/stores/relationshipStore'
import MoreMenu from '@/components/game/MoreMenu'
import RewindModal from '@/components/game/RewindModal'

function uid() {
  return typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).slice(2)
}

function parseEnding(text: string): {
  cleanText: string
  ending?: { type: 'good' | 'bad' | 'true' | 'secret'; title: string }
} {
  const match = text.match(/\[ENDING\](\{[^}]+\})\s*$/)
  if (!match) return { cleanText: text }
  try {
    const ending = JSON.parse(match[1])
    const cleanText = text.slice(0, match.index).trimEnd()
    return { cleanText, ending }
  } catch {
    return { cleanText: text }
  }
}

export default function GamePage() {
  const router = useRouter()

  // ─── 仅用于渲染的响应式状态（驱动 UI 更新）───────────────────────────────
  const genre = useGenreStore((s) => s.genre)
  const worldConfig = useWorldStore((s) => s.worldConfig)
  const isStreaming = useGameStore((s) => s.isStreaming)
  const summariesForUI = useSummaryStore((s) => s.summaries)
  const { styleConfig } = useStyleStore()

  // ─── Setters（Zustand action 引用永远稳定，无需放入依赖数组）──────────────
  const {
    setIsStreaming,
    setCurrentChoices,
    addMessage,
    setStreamingText,
    incrementTurn,
    setStatus,
    setMessages,
  } = useGameStore()
  const { addOrUpdate } = useSaveStore()
  const { addSummary } = useSummaryStore()
  const { addClue } = useClueStore()
  const { initFromNPCs, applyUpdate: applyRelationshipUpdate } = useRelationshipStore()

  const [lastDelta, setLastDelta] = useState<Record<string, number>>({})
  const [newClueFound, setNewClueFound] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [showWorldConfig, setShowWorldConfig] = useState(false)
  const [showStylePanel, setShowStylePanel] = useState(false)
  const [showRewind, setShowRewind] = useState(false)

  useEffect(() => {
    if (!genre || !worldConfig.worldName) {
      router.replace('/')
    }
  }, [genre, worldConfig.worldName, router])

  // ─── handleAction：用 ref 包裹，始终读最新状态，永不产生陈旧闭包 ──────────
  //
  //  核心原则：
  //  1. 所有"需要在异步流程中保持最新"的状态 → useXxxStore.getState() 按需读取
  //  2. 纯粹的 UI 渲染状态（isStreaming 按钮 disable）→ 仍从 hook 读，驱动重渲染
  //  3. handleActionRef.current 始终指向最新函数，useEffect 里调用不再有闭包风险
  //
  const handleActionRef = useRef<(playerAction: string, isOpening?: boolean) => Promise<void>>(
    async () => {}
  )

  handleActionRef.current = async (playerAction: string, isOpening = false) => {
    // 直接读最新状态，不依赖闭包捕获
    const { isStreaming: streaming, turn, status, messages } = useGameStore.getState()
    const { genre: currentGenre } = useGenreStore.getState()
    const { worldConfig: currentWorld } = useWorldStore.getState()
    const { summaries } = useSummaryStore.getState()
    const { ttsEnabled, ttsRate, ttsPitch, ttsVolume } = useSettingsStore.getState()
    const { styleConfig } = useStyleStore.getState()

    if (streaming) return
    stop()

    if (!isOpening) {
      const playerMsg: Message = {
        id: uid(),
        role: 'player',
        content: playerAction,
        turn,
        timestamp: Date.now(),
      }
      addMessage(playerMsg)
      setCurrentChoices([])
    }

    setIsStreaming(true)
    setStreamingText('')
    setNewClueFound(false)

    let fullText = ''
    let choicesFetchPromise: Promise<Response | null> | null = null

    try {
      const summaryContext = summaries.length > 0
        ? `【历史摘要】\n${summaries.map(s => s.content).join('\n')}\n\n`
        : ''

      const res = await fetch('/api/story/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genre: currentGenre,
          worldConfig: currentWorld,
          history: messages.slice(-10),
          playerAction: summaryContext + playerAction,
          status,
          turn,
          styleConfig,
        }),
      })

      if (!res.body) throw new Error('No response body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk
        const { cleanText } = parseStatusDelta(fullText)
        setStreamingText(cleanText)
      }

      // 流读取结束，立刻并行发起选项请求
      // ending 此时还没解析，始终发起请求，后面拿到 ending 再决定是否使用
      const { cleanText: previewText } = parseStatusDelta(fullText)
      choicesFetchPromise = fetch('/api/story/choices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genre: currentGenre,
          lastNarratorText: previewText,
          status,
          turn: turn + 1,
          protagonistName: currentWorld.protagonistName,
          narrativePOV: currentWorld.narrativePOV ?? 'second',
        }),
      }).catch(() => null)
    } catch (err) {
      fullText = `[生成出错：${err instanceof Error ? err.message : '未知错误'}]`
      setStreamingText(fullText)
    }

    let processedText = fullText
    if (currentGenre === 'mystery') {
      const { cleanText: afterClues, clues } = parseClues(processedText)
      processedText = afterClues
      if (clues.length > 0) {
        setNewClueFound(true)
        clues.forEach((clue) => {
          addClue({
            ...clue,
            foundAt: turn,
            timestamp: Date.now(),
            revealed: !!clue.revelation,
          })
        })
        setTimeout(() => setNewClueFound(false), 3000)
      }
    }

    const { cleanText: afterStatus, delta } = parseStatusDelta(processedText)
    const { cleanText, ending } = parseEnding(afterStatus)
    const newStatus = applyStatusDelta(currentGenre!, status, delta)

    const narratorMsg: Message = {
      id: uid(),
      role: 'narrator',
      content: cleanText,
      turn,
      statusDelta: delta,
      timestamp: Date.now(),
    }
    addMessage(narratorMsg)
    setStreamingText('')
    setIsStreaming(false)
    setStatus(newStatus)
    setLastDelta(delta)
    incrementTurn()

    if (ttsEnabled) {
      speak(cleanText, { rate: ttsRate, pitch: ttsPitch, volume: ttsVolume })
    }

    if (!ending) {
      try {
        // 直接 await 已经并行发出的请求，通常此时已完成或接近完成
        const choiceRes = choicesFetchPromise ? await choicesFetchPromise : null
        if (choiceRes?.ok) {
          const { choices } = await choiceRes.json()
          setCurrentChoices(choices ?? [])
        } else {
          setCurrentChoices([])
        }
      } catch {
        setCurrentChoices([])
      }
    }

    // 摘要：读最新 messages（含刚加入的 narratorMsg）
    await triggerSummaryIfNeeded(turn + 1, [...messages, narratorMsg], currentGenre)

    // 关系图谱：异步提取，不阻塞主流程
    if (currentWorld.npcs.length > 0) {
      fetch('/api/relationship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          narratorText: cleanText,
          npcs: currentWorld.npcs,
          protagonistName: currentWorld.protagonistName,
          turn: turn + 1,
        }),
      })
        .then((r) => r.json())
        .then(({ updates }) => {
          updates?.forEach((u: Parameters<typeof applyRelationshipUpdate>[0]) =>
            applyRelationshipUpdate(u)
          )
        })
        .catch(() => {})  // 关系提取失败不影响游戏
    }

    const autoSave: SaveRecord = {
      id: currentWorld.worldName + '-' + currentGenre,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      storyTitle: `${currentWorld.worldName} · ${currentWorld.protagonistName}`,
      genre: currentGenre!,
      chapter: Math.floor((turn + 1) / 20) + 1,
      turn: turn + 1,
      worldConfig: currentWorld,
      statusSnapshot: newStatus,
      recentHistory: [...messages.slice(-9), narratorMsg],
      branchHistory: [],
      ...(ending && {
        ending: { ...ending, unlockedAt: Date.now() },
      }),
    }
    addOrUpdate(autoSave)
  }

  // 稳定的触发函数，供 JSX 事件和 useEffect 调用
  const handleAction = (playerAction: string, isOpening = false) =>
    handleActionRef.current(playerAction, isOpening)

  useEffect(() => {
    const { genre: g } = useGenreStore.getState()
    const { worldConfig: wc } = useWorldStore.getState()
    if (!g || !wc.worldName) return

    const { messages: msgs, isStreaming } = useGameStore.getState()

    // 如果刷新时恰好中断了流式输出，清理残留状态
    if (isStreaming) {
      useGameStore.setState({ isStreaming: false, streamingText: '', currentChoices: [] })
    }

    // 初始化 NPC 关系（已有的不会覆盖）
    if (wc.npcs.length > 0) {
      initFromNPCs(wc.npcs)
    }

    if (msgs.length === 0) {
      handleActionRef.current(wc.openingScene, true)
    }
    return () => stop()
  // 只在组件挂载时执行一次，通过 ref 调用保证拿到最新状态
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function triggerSummaryIfNeeded(
    currentTurn: number,
    currentMessages: Message[],
    currentGenre: string | null,
  ) {
    // 每 20 回合触发一次章节摘要
    if (currentTurn > 0 && currentTurn % 20 === 0) {
      try {
        const chapterNumber = Math.floor(currentTurn / 20)
        const { status } = useGameStore.getState()
        const res = await fetch('/api/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ genre: currentGenre, history: currentMessages, chapterNumber }),
        })
        const { summary, chapterTitle } = await res.json()
        if (summary) {
          const summaryRecord = {
            id: uid(),
            triggerTurn: currentTurn,
            chapterNumber,
            chapterTitle: chapterTitle ?? `第${chapterNumber}章`,
            content: summary,
            statusAtTrigger: status,
            messages: currentMessages,  // 保存本章完整 20 条对话
          }
          addSummary(summaryRecord)
          // 清空消息列表，开始新章节，不再往里塞 summaryMsg
          // （SummaryCard 已经在 StoryPanel 顶部展示摘要，无需重复）
          setMessages([])
        }
      } catch {
        // 摘要失败不影响游戏继续
      }
    }
  }

  function handleRewind(rewindTurn: number, messagesUpToHere: Message[]) {
    const { worldConfig: wc } = useWorldStore.getState()
    const { genre: g } = useGenreStore.getState()
    const { status } = useGameStore.getState()

    // 1. 保存当前主线为自动存档（防止误操作丢失）
    const mainSave = buildSaveRecord()
    addOrUpdate(mainSave)

    // 2. 创建分支存档（独立 id，不覆盖主线）
    const branchSave: SaveRecord = {
      id: uid(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      storyTitle: `${wc.worldName} · 分支·第${rewindTurn}回合`,
      genre: g!,
      chapter: Math.floor(rewindTurn / 20) + 1,
      turn: rewindTurn,
      worldConfig: wc,
      statusSnapshot: status,
      recentHistory: messagesUpToHere.slice(-10),
      branchHistory: [],
      isBranch: true,
      branchFromTurn: rewindTurn,
      branchLabel: `分支·第${rewindTurn}回合`,
      parentId: mainSave.id,
    }
    addOrUpdate(branchSave)

    // 3. 把游戏状态回滚到选定回合
    useGameStore.setState({
      turn: rewindTurn,
      messages: messagesUpToHere,
      currentChoices: [],
      isStreaming: false,
      streamingText: '',
    })

    setShowRewind(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)

    // 4. 触发新一轮 AI 生成选项
    setTimeout(() => {
      const lastNarrator = messagesUpToHere.filter((m) => m.role === 'narrator').slice(-1)[0]
      if (lastNarrator) {
        fetch('/api/story/choices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            genre: g,
            lastNarratorText: lastNarrator.content,
            status,
            turn: rewindTurn + 1,
            protagonistName: wc.protagonistName,
            narrativePOV: wc.narrativePOV ?? 'second',
          }),
        })
          .then((r) => r.json())
          .then(({ choices }) => useGameStore.setState({ currentChoices: choices ?? [] }))
          .catch(() => {})
      }
    }, 100)
  }

  function buildSaveRecord(customName?: string): SaveRecord {
    // 手动存档时也用 getState，确保拿到当前数据而非渲染快照
    const { turn, status, messages } = useGameStore.getState()
    const { worldConfig: wc } = useWorldStore.getState()
    const { genre: g } = useGenreStore.getState()
    const defaultTitle = `${wc.worldName} · ${wc.protagonistName}`
    return {
      id: customName ? uid() : wc.worldName + '-' + g,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      storyTitle: customName ?? defaultTitle,
      genre: g!,
      chapter: Math.floor(turn / 20) + 1,
      turn,
      worldConfig: wc,
      statusSnapshot: status,
      recentHistory: messages.slice(-10),
      branchHistory: [],
    }
  }

  function handleQuickSave() {
    const record = buildSaveRecord()
    addOrUpdate(record)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)
  }

  function handleSaveAs(name: string) {
    const record = buildSaveRecord(name)
    addOrUpdate(record)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)
  }

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
          currentTurn={useGameStore.getState().turn}
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

      {newClueFound && genre === 'mystery' && (
        <div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-sm font-bold animate-fade-in-up"
          style={{
            background: 'rgba(184,150,12,0.2)',
            border: '1px solid rgba(184,150,12,0.6)',
            color: '#B8960C',
            boxShadow: '0 0 20px rgba(184,150,12,0.3)',
          }}
        >
          🔍 发现新线索！
        </div>
      )}

      <main
        className="h-screen flex flex-col px-4 py-4 max-w-2xl mx-auto gap-3"
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
              onWorldConfig={() => setShowWorldConfig(true)}
              onStylePanel={() => setShowStylePanel(true)}
              onChapters={() => router.push('/chapters')}
              onRelationships={() => router.push('/relationships')}
              onClues={() => router.push('/clues')}
              onRewind={() => setShowRewind(true)}
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
          <StatusBar />
        </div>

        <StoryPanel />

        <div className="flex-shrink-0 space-y-2">
          <ChoicesBar onChoice={(c) => handleAction(c)} />
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <FreeInputBox onSubmit={(t) => handleAction(t)} />
            </div>
            <BGMController />
            <TTSToggle />
          </div>
        </div>
      </main>
    </ThemeProvider>
  )
}