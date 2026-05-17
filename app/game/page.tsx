'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useGenreStore } from '@/stores/genreStore'
import { useWorldStore } from '@/stores/worldStore'
import { useGameStore } from '@/stores/gameStore'
import { useSaveStore } from '@/stores/saveStore'
import { GENRE_CONFIG } from '@/lib/themeConfig'
import { parseStatusDelta, applyStatusDelta } from '@/lib/statusBar'
import { upsertSave } from '@/lib/saveManager'
import { Message } from '@/types/game'
import ThemeProvider from '@/components/shared/ThemeProvider'
import StoryPanel from '@/components/game/StoryPanel'
import ChoicesBar from '@/components/game/ChoicesBar'
import FreeInputBox from '@/components/game/FreeInputBox'
import StatusBar from '@/components/game/StatusBar'

function uid() {
  return typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).slice(2)
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
  } = useGameStore()
  const { addOrUpdate } = useSaveStore()

  if (!genre || !worldConfig.worldName) {
    router.replace('/')
    return null
  }

  const config = GENRE_CONFIG[genre]

  useEffect(() => {
    if (messages.length === 0) {
      handleAction(worldConfig.openingScene, true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAction = useCallback(
    async (playerAction: string, isOpening = false) => {
      if (isStreaming) return

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
        const res = await fetch('/api/story/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            genre,
            worldConfig,
            history: messages.slice(-10),
            playerAction,
            status,
            turn,
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

      const { cleanText, delta } = parseStatusDelta(fullText)
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
      incrementTurn()

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
      }
      addOrUpdate(saveRecord)
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [genre, worldConfig, messages, status, turn, isStreaming]
  )

  return (
    <ThemeProvider>
      <main
        className="h-screen flex flex-col px-4 py-4 max-w-2xl mx-auto gap-3"
        style={{ color: config.theme.text }}
      >
        <div className="flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => router.push('/')}
            className="text-sm transition-opacity hover:opacity-70"
            style={{ color: config.theme.textMuted }}
          >
            ← 主页
          </button>
          <div className="flex items-center gap-2">
            <span>{config.emoji}</span>
            <span className="text-sm font-semibold" style={{ color: config.theme.primary }}>
              {worldConfig.worldName}
            </span>
          </div>
          <div className="w-10" />
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