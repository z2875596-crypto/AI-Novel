'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GenreKey } from '@/types/genre'
import { GENRE_CONFIG, getRandomGenre } from '@/lib/themeConfig'
import { useGenreStore } from '@/stores/genreStore'
import { useGameStore } from '@/stores/gameStore'
import { useWorldStore } from '@/stores/worldStore'
import GenreBackground from './GenreBackground'

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
  const [hoveredGenre, setHoveredGenre] = useState<GenreKey | 'random' | null>(null)

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
    <>
      <GenreBackground hoveredGenre={hoveredGenre} />
      <div className="grid grid-cols-3 gap-3 relative z-10">
        {DISPLAY_GENRES.map((key, i) => {
          const cfg = GENRE_CONFIG[key]
          return (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              onMouseEnter={() => setHoveredGenre(key)}
              onMouseLeave={() => setHoveredGenre(null)}
              className="group relative flex flex-col items-center justify-center gap-2 rounded-2xl p-5 transition-all duration-300 hover:scale-[1.05] active:scale-[0.96] animate-fade-in-up overflow-hidden"
              style={{
                background: cfg.theme.surface,
                border: `1px solid ${cfg.theme.border}`,
                animationDelay: `${i * 0.06}s`,
              }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle at 50% 80%, ${cfg.theme.primary}20 0%, transparent 65%)`,
                }}
              />
              <div
                className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(90deg, transparent, ${cfg.theme.primary}, transparent)`,
                }}
              />
              <span
                className="text-3xl relative z-10 transition-transform duration-300 group-hover:scale-110"
                style={{ filter: 'drop-shadow(0 0 8px currentColor)' }}
              >
                {cfg.emoji}
              </span>
              <span
                className="text-sm font-bold relative z-10 tracking-wide"
                style={{ color: cfg.theme.text }}
              >
                {cfg.label}
              </span>
              <span
                className="text-xs text-center leading-tight relative z-10 line-clamp-2 opacity-70 group-hover:opacity-100 transition-opacity duration-200"
                style={{ color: cfg.theme.textMuted }}
              >
                {cfg.description}
              </span>
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-0 group-hover:w-3/4 transition-all duration-300 rounded-full"
                style={{ background: cfg.theme.primary }}
              />
            </button>
          )
        })}

        {/* 随机按钮 */}
        <button
          onClick={handleRandom}
          onMouseEnter={() => setHoveredGenre('random')}
          onMouseLeave={() => setHoveredGenre(null)}
          className="group relative flex flex-col items-center justify-center gap-2 rounded-2xl p-5 transition-all duration-300 hover:scale-[1.05] active:scale-[0.96] animate-fade-in-up overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px dashed rgba(255,255,255,0.15)',
            animationDelay: '0.48s',
          }}
        >
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'radial-gradient(circle at 50% 80%, rgba(255,255,255,0.06) 0%, transparent 65%)',
            }}
          />
          <span className="text-3xl relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
            🎲
          </span>
          <span className="text-sm font-bold relative z-10" style={{ color: 'rgba(255,255,255,0.8)' }}>
            随机
          </span>
          <span className="text-xs text-center relative z-10 opacity-50 group-hover:opacity-80 transition-opacity">
            随机抽一种题材
          </span>
        </button>
      </div>
    </>
  )
}