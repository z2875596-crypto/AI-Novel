'use client'

import { useEffect, useCallback, useState } from 'react'
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
import SaveAsModal from '@/components/game/SaveAsModal'

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
  const genre = useGenreStore((s) => s.genre)
  const worldConfig = useWorldStore((s) => s.worldConfig)
  const {
    turn,
    status,
    messages,
    isStreaming,
    setIsStreaming,
    setCurrentChoices,
    addMessage,
    setStreamingText,
    incrementTurn,
    setStatus,
    setMessages,
  } = useGameStore()
  const { addOrUpdate } = useSaveStore()
  const { summaries, addSummary } = useSummaryStore()
  const { ttsEnabled, ttsRate, ttsPitch, ttsVolume } = useSettingsStore()
  const { styleConfig } = useStyleStore()
  const { addClue } = useClueStore()
  const [lastDelta, setLastDelta] = useState<Record<string, number>>({})
  const [newClueFound, setNewClueFound] = useState(false)
  const [showSaveAs, setShowSaveAs] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (!genre || !worldConfig.worldName) {
      router.replace('/')
    }
  }, [genre, worldConfig.worldName, router])

  useEffect(() => {
    if (!genre || !worldConfig.worldName) return
    if (messages.length === 0) {
      handleAction(worldConfig.openingScene, true)
    }
    return () => stop()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function triggerSummaryIfNeeded(currentTurn: number, currentMessages: Message[]) {
    if (currentTurn > 0 && currentTurn % 10 === 0) {
      try {
        const res = await fetch('/api/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ genre, history: currentMessages }),
        })
        const { summary } = await res.json()
        if (summary) {
          const summaryRecord = {
            id: uid(),
            triggerTurn: currentTurn,
            content: summary,
            statusAtTrigger: status,
          }
          addSummary(summaryRecord)
          const summaryMsg: Message = {
            id: uid(),
            role: 'summary',
            content: summary,
            turn: currentTurn,
            timestamp: Date.now(),
          }
          setMessages([summaryMsg])
        }
      } catch {
        // 摘要失败不影响游戏继续
      }
    }
  }

  function buildSaveRecord(customName?: string): SaveRecord {
    const defaultTitle = `${worldConfig.worldName} · ${worldConfig.protagonistName}`
    return {
      id: customName ? uid() : worldConfig.worldName + '-' + genre,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      storyTitle: customName ?? defaultTitle,
      genre: genre!,
      chapter: Math.floor(turn / 10) + 1,
      turn,
      worldConfig,
      statusSnapshot: status,
      recentHistory: messages.slice(-10),
      branchHistory: [],
    }
  }

  function handleSaveAs(name: string) {
    const record = buildSaveRecord(name)
    addOrUpdate(record)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)
  }

  const handleAction = useCallback(
    async (playerAction: string, isOpening = false) => {
      if (isStreaming) return

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

      try {
        const summaryContext = summaries.length > 0
          ? `【历史摘要】\n${summaries.map(s => s.content).join('\n')}\n\n`
          : ''

        const res = await fetch('/api/story/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            genre,
            worldConfig,
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
      } catch (err) {
        fullText = `[生成出错：${err instanceof Error ? err.message : '未知错误'}]`
        setStreamingText(fullText)
      }

      // 解析线索（仅悬疑题材）
      let processedText = fullText
      if (genre === 'mystery') {
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
      const newStatus = applyStatusDelta(genre!, status, delta)

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
          const choiceRes = await fetch('/api/story/choices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              genre,
              lastNarratorText: cleanText,
              status: newStatus,
              turn: turn + 1,
            }),
          })
          const { choices } = await choiceRes.json()
          setCurrentChoices(choices ?? [])
        } catch {
          setCurrentChoices([])
        }
      }

      await triggerSummaryIfNeeded(turn + 1, [...messages, narratorMsg])

      // 自动存档（覆盖同一个 id）
      const autoSave: SaveRecord = {
        id: worldConfig.worldName + '-' + genre,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        storyTitle: `${worldConfig.worldName} · ${worldConfig.protagonistName}`,
        genre: genre!,
        chapter: Math.floor((turn + 1) / 10) + 1,
        turn: turn + 1,
        worldConfig,
        statusSnapshot: newStatus,
        recentHistory: [...messages.slice(-9), narratorMsg],
        branchHistory: [],
        ...(ending && {
          ending: { ...ending, unlockedAt: Date.now() },
        }),
      }
      addOrUpdate(autoSave)
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [genre, worldConfig, messages, status, turn, isStreaming, summaries, ttsEnabled, ttsRate, ttsPitch, ttsVolume, styleConfig]
  )

  if (!genre || !worldConfig.worldName) return null

  const config = GENRE_CONFIG[genre]

  return (
    <ThemeProvider>
      <StatusDeltaToast delta={lastDelta} />

      {/* 另存为弹窗 */}
      {showSaveAs && (
        <SaveAsModal
          defaultName={`${worldConfig.worldName} · 第${Math.floor(turn / 10) + 1}章 · 分支`}
          onSave={handleSaveAs}
          onClose={() => setShowSaveAs(false)}
        />
      )}

      {/* 保存成功提示 */}
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

      {/* 发现新线索提示 */}
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

          <div className="flex items-center gap-2">
            <span className="text-base">{config.emoji}</span>
            <span className="text-sm font-semibold" style={{ color: config.theme.primary }}>
              {worldConfig.worldName}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <BGMController />
            <TTSToggle />
            {genre === 'mystery' && (
              <button
                onClick={() => router.push('/clues')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all hover:brightness-110 active:scale-95"
                style={{
                  background: 'rgba(184,150,12,0.15)',
                  color: '#B8960C',
                  border: '1px solid rgba(184,150,12,0.4)',
                }}
              >
                🔍 线索
              </button>
            )}
            {/* 另存为按钮 */}
            <button
              onClick={() => setShowSaveAs(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all hover:brightness-110 active:scale-95"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: config.theme.textMuted,
                border: `1px solid ${config.theme.border}`,
              }}
            >
              💾
            </button>
            <button
              onClick={() => router.push('/saves')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all hover:brightness-110 active:scale-95"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: config.theme.textMuted,
                border: `1px solid ${config.theme.border}`,
              }}
            >
              存档
            </button>
          </div>
        </div>

        <div className="flex-shrink-0">
          <StatusBar />
        </div>

        <StoryPanel />

        <div className="flex-shrink-0 space-y-2">
          <ChoicesBar onChoice={(c) => handleAction(c)} />
          <FreeInputBox onSubmit={(t) => handleAction(t)} />
        </div>
      </main>
    </ThemeProvider>
  )
}