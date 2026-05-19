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
import { GENRE_CONFIG } from '@/lib/themeConfig'
import { parseStatusDelta, applyStatusDelta } from '@/lib/statusBar'
import { speak, stop } from '@/lib/tts'
import { Message } from '@/types/game'
import ThemeProvider from '@/components/shared/ThemeProvider'
import StoryPanel from '@/components/game/StoryPanel'
import ChoicesBar from '@/components/game/ChoicesBar'
import FreeInputBox from '@/components/game/FreeInputBox'
import StatusBar from '@/components/game/StatusBar'
import TTSToggle from '@/components/game/TTSToggle'
import BGMController from '@/components/game/BGMController'
import StatusDeltaToast from '@/components/game/StatusDeltaToast'

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
  const [lastDelta, setLastDelta] = useState<Record<string, number>>({})

  if (!genre || !worldConfig.worldName) {
    router.replace('/')
    return null
  }

  const config = GENRE_CONFIG[genre]

  useEffect(() => {
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

      const { cleanText: afterStatus, delta } = parseStatusDelta(fullText)
      const { cleanText, ending } = parseEnding(afterStatus)
      const newStatus = applyStatusDelta(genre, status, delta)

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

      const saveRecord = {
        id: worldConfig.worldName + '-' + genre,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        storyTitle: `${worldConfig.worldName} · ${worldConfig.protagonistName}`,
        genre,
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
      addOrUpdate(saveRecord)
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [genre, worldConfig, messages, status, turn, isStreaming, summaries, ttsEnabled, ttsRate, ttsPitch, ttsVolume, styleConfig]
  )

  return (
    <ThemeProvider>
      <StatusDeltaToast delta={lastDelta} />
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