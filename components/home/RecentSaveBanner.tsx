'use client'

import { restoreSave } from '@/lib/session'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSaveStore } from '@/stores/saveStore'
import { GENRE_CONFIG } from '@/lib/themeConfig'

export default function RecentSaveBanner() {
  const router = useRouter()
  const { saves, loadFromStorage } = useSaveStore()
  const save = saves[0] ?? null

  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])

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
    restoreSave(save)

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
