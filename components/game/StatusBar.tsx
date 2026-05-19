'use client'

import { useEffect, useRef, useState } from 'react'
import { useGenreStore } from '@/stores/genreStore'
import { useGameStore } from '@/stores/gameStore'
import { GENRE_CONFIG } from '@/lib/themeConfig'
import { getVibe } from '@/lib/statusVibes'

export default function StatusBar() {
  const genre = useGenreStore((s) => s.genre)
  const status = useGameStore((s) => s.status)
  const turn = useGameStore((s) => s.turn)
  const prevStatus = useRef<Record<string, number>>({})
  const [changedKeys, setChangedKeys] = useState<Set<string>>(new Set())

  if (!genre) return null
  const config = GENRE_CONFIG[genre]

  useEffect(() => {
    const changed = new Set<string>()
    for (const bar of config.bars) {
      const prev = prevStatus.current[bar.key] ?? 0
      const curr = status[bar.key] ?? 0
      if (prev !== curr) changed.add(bar.key)
    }
    if (changed.size > 0) {
      setChangedKeys(changed)
      setTimeout(() => setChangedKeys(new Set()), 1500)
    }
    prevStatus.current = { ...status }
  }, [status, config.bars])

  return (
    <div
      className="rounded-xl border px-4 py-3 flex flex-wrap items-center gap-4"
      style={{
        background: config.theme.surface,
        borderColor: config.theme.border,
      }}
    >
      {/* 回合 */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs" style={{ color: config.theme.textMuted }}>第</span>
        <span className="text-sm font-bold tabular-nums" style={{ color: config.theme.text }}>
          {turn}
        </span>
        <span className="text-xs" style={{ color: config.theme.textMuted }}>回合</span>
      </div>

      <div className="w-px h-4 opacity-30" style={{ background: config.theme.border }} />

      {/* 各状态栏情绪可视化 */}
      {config.bars.map((bar) => {
        const val = status[bar.key] ?? 0
        const vibe = getVibe(genre, bar.key, val)
        const isChanged = changedKeys.has(bar.key)

        return (
          <div
            key={bar.key}
            className="flex items-center gap-2 transition-all duration-300"
            style={{
              filter: isChanged ? `drop-shadow(0 0 8px ${vibe?.color ?? bar.color})` : 'none',
              transform: isChanged ? 'scale(1.08)' : 'scale(1)',
            }}
          >
            {/* 图标 */}
            <span
              className="text-lg transition-all duration-300"
              style={{
                filter: isChanged ? 'brightness(1.3)' : 'brightness(1)',
              }}
            >
              {vibe?.icon ?? '❓'}
            </span>

            {/* 标签 */}
            <div className="flex flex-col leading-none">
              <span
                className="text-xs font-medium transition-colors duration-300"
                style={{ color: vibe?.color ?? config.theme.textMuted }}
              >
                {vibe?.label ?? bar.label}
              </span>
              <span
                className="text-xs opacity-60"
                style={{ color: config.theme.textMuted }}
              >
                {bar.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}