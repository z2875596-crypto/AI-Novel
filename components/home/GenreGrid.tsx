'use client'

import { useRouter } from 'next/navigation'
import { GenreKey } from '@/types/genre'
import { GENRE_CONFIG, getRandomGenre } from '@/lib/themeConfig'
import { useGenreStore } from '@/stores/genreStore'
import { useGameStore } from '@/stores/gameStore'
import { useWorldStore } from '@/stores/worldStore'

const DISPLAY_GENRES: GenreKey[] = [
  'romance', 'xuanhuan', 'mystery',
  'ancient', 'magic', 'urban',
  'horror', 'comedy',
]

export default function GenreGrid() {
  const router = useRouter()
  const setGenre = useGenreStore((s) => s.setGenre)
  const resetGame = useGameStore((s) => s.resetGame)
  const resetWorld = useWorldStore((s) => s.reset)

  function handleSelect(key: GenreKey) {
    setGenre(key)
    resetGame({})
    resetWorld()
    router.push('/setup')
  }

  function handleRandom() {
    handleSelect(getRandomGenre())
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {DISPLAY_GENRES.map((key) => {
        const cfg = GENRE_CONFIG[key]
        return (
          <button
            key={key}
            onClick={() => handleSelect(key)}
            className="group relative flex flex-col items-center justify-center gap-2 rounded-xl border p-5 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] hover:brightness-125"
            style={{
              background: cfg.theme.surface,
              borderColor: cfg.theme.border,
            }}
          >
            <div
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{
                boxShadow: `inset 0 0 0 1px ${cfg.theme.primary}66`,
                background: `radial-gradient(circle at center, ${cfg.theme.primary}12 0%, transparent 70%)`,
              }}
            />
            <span className="text-3xl">{cfg.emoji}</span>
            <span
              className="text-sm font-semibold relative z-10"
              style={{ color: cfg.theme.text }}
            >
              {cfg.label}
            </span>
            <span
              className="text-xs text-center leading-tight relative z-10 line-clamp-2"
              style={{ color: cfg.theme.textMuted }}
            >
              {cfg.description}
            </span>
          </button>
        )
      })}

      <button
        onClick={handleRandom}
        className="group relative flex flex-col items-center justify-center gap-2 rounded-xl border p-5 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
        style={{
          background: 'rgba(255,255,255,0.04)',
          borderColor: 'rgba(255,255,255,0.12)',
          borderStyle: 'dashed',
        }}
      >
        <span className="text-3xl">🎲</span>
        <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>
          随机
        </span>
        <span className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>
          随机抽一种题材
        </span>
      </button>
    </div>
  )
}