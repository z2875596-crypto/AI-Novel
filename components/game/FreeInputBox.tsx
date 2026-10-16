'use client'

import { useState } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { useGenreStore } from '@/stores/genreStore'
import { GENRE_CONFIG } from '@/lib/themeConfig'

interface Props {
  onSubmit: (text: string) => void
}

export default function FreeInputBox({ onSubmit }: Props) {
  const [value, setValue] = useState('')
  const isStreaming = useGameStore((s) => s.isStreaming)
  const genre = useGenreStore((s) => s.genre)

  if (!genre) return null
  const config = GENRE_CONFIG[genre]

  function handleSubmit() {
    const trimmed = value.trim()
    if (!trimmed || isStreaming) return
    onSubmit(trimmed)
    setValue('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        aria-label="角色行动"
        placeholder="例如：询问对方为什么反对这个方案"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isStreaming}
        className="flex-1 rounded-xl border px-4 py-3 text-sm outline-none transition-colors disabled:opacity-40"
        style={{
          background: config.theme.surface,
          borderColor: config.theme.border,
          color: config.theme.text,
        }}
      />
      <button
        aria-label="尝试此行动"
        onClick={handleSubmit}
        disabled={!value.trim() || isStreaming}
        className="px-4 py-3 rounded-xl text-sm font-medium transition-all hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: config.theme.primary, color: '#fff' }}
      >
        →
      </button>
    </div>
  )
}
