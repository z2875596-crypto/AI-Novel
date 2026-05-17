'use client'

import { useGenreStore } from '@/stores/genreStore'
import { useGameStore } from '@/stores/gameStore'
import { GENRE_CONFIG } from '@/lib/themeConfig'

export default function StatusBar() {
  const genre = useGenreStore((s) => s.genre)
  const status = useGameStore((s) => s.status)
  const turn = useGameStore((s) => s.turn)

  if (!genre) return null
  const config = GENRE_CONFIG[genre]

  return (
    <div
      className="rounded-xl border px-4 py-3 flex flex-wrap items-center gap-4"
      style={{
        background: config.theme.surface,
        borderColor: config.theme.border,
      }}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-xs" style={{ color: config.theme.textMuted }}>第</span>
        <span className="text-sm font-bold tabular-nums" style={{ color: config.theme.text }}>
          {turn}
        </span>
        <span className="text-xs" style={{ color: config.theme.textMuted }}>回合</span>
      </div>

      <div className="w-px h-4 opacity-30" style={{ background: config.theme.border }} />

      {config.bars.map((bar) => {
        const val = status[bar.key] ?? 0
        const pct = Math.min(100, (val / bar.max) * 100)

        return (
          <div key={bar.key} className="flex items-center gap-2 min-w-[100px]">
            <span className="text-xs flex-shrink-0" style={{ color: config.theme.textMuted }}>
              {bar.label}
            </span>
            <div
              className="flex-1 h-1.5 rounded-full overflow-hidden"
              style={{ background: `${bar.color}33` }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: bar.color,
                  boxShadow: `0 0 6px ${bar.color}88`,
                }}
              />
            </div>
            <span
              className="text-xs tabular-nums flex-shrink-0 font-medium"
              style={{ color: bar.color }}
            >
              {bar.key === 'money' ? val.toLocaleString() : val}
            </span>
          </div>
        )
      })}
    </div>
  )
}
