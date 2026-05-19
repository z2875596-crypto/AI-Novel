'use client'

import { useEffect, useRef, useState } from 'react'
import { useGenreStore } from '@/stores/genreStore'
import { useGameStore } from '@/stores/gameStore'
import { GENRE_CONFIG } from '@/lib/themeConfig'

export default function StatusBar() {
  const genre = useGenreStore((s) => s.genre)
  const status = useGameStore((s) => s.status)
  const turn = useGameStore((s) => s.turn)
  const prevStatus = useRef<Record<string, number>>({})
  const [changedKeys, setChangedKeys] = useState<Set<string>>(new Set())

  if (!genre) return null
  const config = GENRE_CONFIG[genre]

  // 检测变化的 key，触发高亮
  useEffect(() => {
    const changed = new Set<string>()
    for (const bar of config.bars) {
      const prev = prevStatus.current[bar.key] ?? 0
      const curr = status[bar.key] ?? 0
      if (prev !== curr) changed.add(bar.key)
    }
    if (changed.size > 0) {
      setChangedKeys(changed)
      setTimeout(() => setChangedKeys(new Set()), 1000)
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

      {/* 各状态栏 */}
      {config.bars.map((bar) => {
        const val = status[bar.key] ?? 0
        const pct = Math.min(100, (val / bar.max) * 100)
        const isChanged = changedKeys.has(bar.key)

        return (
          <div
            key={bar.key}
            className="flex items-center gap-2 min-w-[100px] transition-all duration-300"
            style={{
              filter: isChanged ? `drop-shadow(0 0 6px ${bar.color})` : 'none',
            }}
          >
            <span
              className="text-xs flex-shrink-0 transition-colors duration-300"
              style={{ color: isChanged ? bar.color : config.theme.textMuted }}
            >
              {bar.label}
            </span>
            <div
              className="flex-1 h-1.5 rounded-full overflow-hidden"
              style={{ background: `${bar.color}33` }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  background: bar.color,
                  boxShadow: isChanged
                    ? `0 0 10px ${bar.color}, 0 0 20px ${bar.color}88`
                    : `0 0 6px ${bar.color}88`,
                }}
              />
            </div>
            <span
              className="text-xs tabular-nums flex-shrink-0 font-bold transition-all duration-300"
              style={{
                color: bar.color,
                transform: isChanged ? 'scale(1.2)' : 'scale(1)',
              }}
            >
              {bar.key === 'money' ? val.toLocaleString() : val}
            </span>
          </div>
        )
      })}
    </div>
  )
}