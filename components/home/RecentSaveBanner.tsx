'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SaveRecord } from '@/types/save'
import { getLatestSave } from '@/lib/saveManager'
import { GENRE_CONFIG } from '@/lib/themeConfig'
import { useGameStore } from '@/stores/gameStore'
import { useGenreStore } from '@/stores/genreStore'
import { useWorldStore } from '@/stores/worldStore'
import { useSummaryStore } from '@/stores/summaryStore'

export default function RecentSaveBanner() {
  const router = useRouter()
  const [save, setSave] = useState<SaveRecord | null>(null)
  const setGenre = useGenreStore((s) => s.setGenre)
  const setWorldConfig = useWorldStore((s) => s.setWorldConfig)
  const resetSummaries = useSummaryStore((s) => s.reset)

  useEffect(() => {
    setSave(getLatestSave())
  }, [])

  if (!save) return null

  const config = GENRE_CONFIG[save.genre]
  const date = new Date(save.updatedAt).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  function handleContinue() {
    if (!save) return
    setGenre(save.genre)
    setWorldConfig(save.worldConfig)
    resetSummaries()

    const persisted = useGameStore.getState()
    const isSameGame =
      persisted.turn === save.turn &&
      persisted.messages.length > 0

    const restoredMessages = isSameGame ? persisted.messages : save.recentHistory
    const restoredChoices = isSameGame ? persisted.currentChoices : []

    useGameStore.setState({
      turn: save.turn,
      status: save.statusSnapshot,
      messages: restoredMessages,
      currentChoices: restoredChoices,
      isStreaming: false,
      streamingText: '',
    })

    if (!isSameGame || restoredChoices.length === 0) {
      const lastNarrator = restoredMessages
        .filter((m) => m.role === 'narrator')
        .slice(-1)[0]

      if (lastNarrator) {
        fetch('/api/story/choices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            genre: save.genre,
            lastNarratorText: lastNarrator.content,
            status: save.statusSnapshot,
            turn: save.turn + 1,
            protagonistName: save.worldConfig.protagonistName,
            narrativePOV: save.worldConfig.narrativePOV ?? 'second',
          }),
        })
          .then((r) => r.json())
          .then(({ choices }) => {
            if (choices?.length > 0) {
              useGameStore.setState({ currentChoices: choices })
            }
          })
          .catch(() => {})
      }
    }

    router.push('/game')
  }

  return (
    <div
      className="mb-8 rounded-xl border p-4 flex items-center justify-between gap-4 animate-fade-in-up"
      style={{
        borderColor: config.theme.border,
        background: config.theme.surface,
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-2xl flex-shrink-0">{config.emoji}</span>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm truncate" style={{ color: config.theme.text }}>
              {save.storyTitle}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
              style={{
                background: config.theme.primary + '33',
                color: config.theme.primary,
              }}
            >
              {config.label}
            </span>
          </div>
          <div className="text-xs mt-0.5" style={{ color: config.theme.textMuted }}>
            第 {save.chapter} 回 · 第 {save.turn} 回合 · {date}
          </div>
        </div>
      </div>
      <button
        onClick={handleContinue}
        className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:brightness-110 active:scale-95"
        style={{
          background: config.theme.primary,
          color: '#fff',
        }}
      >
        继续
      </button>
    </div>
  )
}
