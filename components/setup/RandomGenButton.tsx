'use client'

import { useState } from 'react'
import { GenreKey } from '@/types/genre'
import { WorldConfig } from '@/types/world'

interface Props {
  genre: GenreKey
  onGenerated: (data: Partial<WorldConfig> & { suggestedNPCs?: { name: string; role: string; traits: string }[] }) => void
}

export default function RandomGenButton({ genre, onGenerated }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch('/api/worldgen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genre }),
      })
      const data = await res.json()
      onGenerated(data)
    } catch {
      alert('生成失败，请检查网络或 API Key 配置')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        borderColor: 'var(--theme-primary)',
        color: 'var(--theme-primary)',
        background: 'transparent',
      }}
    >
      <span className={loading ? 'animate-spin' : ''}>🎲</span>
      {loading ? '生成中…' : 'AI 随机生成设定'}
    </button>
  )
}