'use client'

import { useState } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { useGenreStore } from '@/stores/genreStore'
import { GENRE_CONFIG } from '@/lib/themeConfig'

export default function PlotHintInput() {
  const genre = useGenreStore((s) => s.genre)
  const plotHint = useGameStore((s) => s.plotHint)
  const setPlotHint = useGameStore((s) => s.setPlotHint)

  const [expanded, setExpanded] = useState(false)
  const [draft, setDraft] = useState('')

  if (!genre) return null
  const config = GENRE_CONFIG[genre]

  const hasHint = !!plotHint

  function handleConfirm() {
    setPlotHint(draft.trim())
    setDraft('')
    setExpanded(false)
  }

  function handleClear() {
    setPlotHint('')
    setDraft('')
  }

  const preview = plotHint.length > 10 ? plotHint.slice(0, 10) + '…' : plotHint

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all hover:brightness-110 active:scale-95"
        style={{
          background: hasHint ? config.theme.primary + '33' : 'rgba(255,255,255,0.06)',
          color: hasHint ? config.theme.primary : config.theme.textMuted,
          border: `1px solid ${hasHint ? config.theme.primary + '66' : config.theme.border}`,
        }}
        title={hasHint ? plotHint : '剧情干预'}
      >
        <span>✍</span>
        {hasHint ? (
          <span className="max-w-[6em] truncate">{preview}</span>
        ) : (
          <span>干预</span>
        )}
      </button>

      {expanded && (
        <div className="flex items-center gap-1.5 animate-fade-in">
          <input
            type="text"
            placeholder="希望接下来出现什么情节…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm() }}
            className="w-40 rounded-lg border px-3 py-1.5 text-xs outline-none transition-colors"
            style={{
              background: config.theme.surface,
              borderColor: config.theme.border,
              color: config.theme.text,
            }}
          />
          <button
            onClick={handleConfirm}
            disabled={!draft.trim()}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: config.theme.primary, color: '#fff' }}
          >
            确定
          </button>
          {hasHint && (
            <button
              onClick={handleClear}
              className="text-xs opacity-50 hover:opacity-100 transition-opacity px-1"
              style={{ color: config.theme.textMuted }}
            >
              清除
            </button>
          )}
        </div>
      )}
    </div>
  )
}
