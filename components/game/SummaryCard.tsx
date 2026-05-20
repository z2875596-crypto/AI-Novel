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
      className="rounded-xl border p-4 my-2 animate-fade-in-up"
      style={{
        borderColor: config.theme.primary + '44',
        background: config.theme.primary + '0d',
      }}
    >
      {/* 章节标题 */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">📖</span>
        <div>
          <span
            className="text-xs font-bold tracking-wider"
            style={{ color: config.theme.primary }}
          >
            第 {summary.chapterNumber} 章
          </span>
          {summary.chapterTitle && (
            <span
              className="text-xs ml-2 font-semibold"
              style={{ color: config.theme.text }}
            >
              {summary.chapterTitle}
            </span>
          )}
        </div>
        <div
          className="ml-auto text-xs"
          style={{ color: config.theme.textMuted }}
        >
          第 {summary.triggerTurn} 回合
        </div>
      </div>

      {/* 分割线 */}
      <div
        className="w-full h-px mb-2"
        style={{ background: config.theme.primary + '33' }}
      />

      {/* 摘要内容 */}
      <p
        className="text-xs leading-relaxed italic"
        style={{ color: config.theme.textMuted }}
      >
        {summary.content}
      </p>
    </div>
  )
}