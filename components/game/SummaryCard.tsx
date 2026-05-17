'use client'

import { useGenreStore } from '@/stores/genreStore'
import { GENRE_CONFIG } from '@/lib/themeConfig'
import { Summary } from '@/stores/summaryStore'

interface Props {
  summary: Summary
}

export default function SummaryCard({ summary }: Props) {
  const genre = useGenreStore((s) => s.genre)
  if (!genre) return null
  const config = GENRE_CONFIG[genre]

  return (
    <div
      className="rounded-xl border p-4 my-2"
      style={{
        borderColor: config.theme.primary + '44',
        background: config.theme.primary + '11',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">📖</span>
        <span
          className="text-xs font-semibold"
          style={{ color: config.theme.primary }}
        >
          故事回顾 · 第 {summary.triggerTurn} 回合前
        </span>
      </div>
      <p
        className="text-xs leading-relaxed italic"
        style={{ color: config.theme.textMuted }}
      >
        {summary.content}
      </p>
    </div>
  )
}