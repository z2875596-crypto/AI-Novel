'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GenreKey } from '@/types/genre'
import { SubplotKey } from '@/types/subplot'
import { SUBPLOT_OPTIONS } from '@/types/subplot'
import { GENRE_CONFIG, getRandomGenre, applyTheme } from '@/lib/themeConfig'
import { useGenreStore } from '@/stores/genreStore'
import { useGameStore } from '@/stores/gameStore'
import { useWorldStore } from '@/stores/worldStore'
import GenreBackground from './GenreBackground'

const DISPLAY_GENRES: GenreKey[] = [
  'urban', 'ancient', 'xuanhuan',
  'magic', 'mystery', 'horror',
]

export default function GenreGrid() {
  const router = useRouter()
  const setGenre = useGenreStore((s) => s.setGenre)
  const setSubplots = useGenreStore((s) => s.setSubplots)
  const resetGame = useGameStore((s) => s.resetGame)
  const resetWorld = useWorldStore((s) => s.reset)
  const [hoveredGenre, setHoveredGenre] = useState<GenreKey | 'random' | null>(null)
  const [selectedGenre, setSelectedGenre] = useState<GenreKey | null>(null)
  const [selectedSubplotKeys, setSelectedSubplotKeys] = useState<SubplotKey[]>([])

  function handleHover(key: GenreKey | 'random' | null) {
    setHoveredGenre(key)
    if (key && key !== 'random') {
      applyTheme(GENRE_CONFIG[key].theme)
    } else if (key === 'random') {
      applyTheme({
        primary: '#ffffff',
        secondary: '#cccccc',
        background: '#0a0a0a',
        surface: '#1a1a1a',
        surfaceHover: '#2a2a2a',
        text: '#ffffff',
        textMuted: '#888888',
        border: '#333333',
        fontFamily: 'default',
      })
    } else {
      const currentGenre = useGenreStore.getState().genre
      if (currentGenre) {
        applyTheme(GENRE_CONFIG[currentGenre].theme)
      }
    }
  }

  function handleCardClick(key: GenreKey) {
    if (selectedGenre === key) {
      setSelectedGenre(null)
      setSelectedSubplotKeys([])
    } else {
      setSelectedGenre(key)
      setSelectedSubplotKeys([])
    }
  }

  function toggleSubplot(key: SubplotKey) {
    setSelectedSubplotKeys((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key)
      if (prev.length >= 2) return prev
      return [...prev, key]
    })
  }

  function handleStart() {
    if (!selectedGenre) return
    setGenre(selectedGenre)
    setSubplots(selectedSubplotKeys)
    resetGame({})
    resetWorld()
    router.push('/setup')
  }

  return (
    <>
      <GenreBackground hoveredGenre={hoveredGenre} />
      <div className="grid grid-cols-3 gap-3 relative z-10">
        {DISPLAY_GENRES.map((key, i) => {
          const cfg = GENRE_CONFIG[key]
          const isSelected = selectedGenre === key
          const isOtherSelected = selectedGenre !== null && selectedGenre !== key

          return (
            <div
              key={key}
              className="flex flex-col rounded-2xl transition-all duration-500"
              style={{
                background: isSelected ? cfg.theme.surface : 'transparent',
                border: isSelected ? `1px solid ${cfg.theme.primary}44` : '1px solid transparent',
                boxShadow: isSelected ? `0 0 24px ${cfg.theme.primary}22` : 'none',
                opacity: isOtherSelected ? 0.4 : 1,
              }}
            >
              <button
                onClick={() => handleCardClick(key)}
                onMouseEnter={() => !isSelected && handleHover(key)}
                onMouseLeave={() => !isSelected && handleHover(null)}
                className="group relative flex flex-col items-center justify-center gap-2 rounded-2xl p-5 transition-all duration-300 hover:scale-[1.05] active:scale-[0.96] overflow-hidden w-full"
                style={{
                  background: cfg.theme.surface,
                  border: `1px solid ${cfg.theme.border}`,
                  animationDelay: `${i * 0.06}s`,
                  animationFillMode: 'backwards',
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
                {isSelected && (
                  <span
                    className="absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full z-10"
                    style={{
                      background: cfg.theme.primary + '22',
                      color: cfg.theme.primary,
                    }}
                  >
                    ✓ 已选择
                  </span>
                )}
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

              {/* 展开区域 */}
              <div
                className="overflow-hidden transition-all duration-500 ease-in-out"
                style={{
                  maxHeight: isSelected ? '320px' : '0px',
                  opacity: isSelected ? 1 : 0,
                }}
              >
                <div
                  className="px-4 pb-4 pt-1 space-y-3"
                  style={{ borderTop: `1px solid ${cfg.theme.border}66` }}
                >
                  <p className="text-xs" style={{ color: cfg.theme.textMuted }}>
                    添加副线（可选，最多2个）：
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SUBPLOT_OPTIONS
                      .filter((sub) => !(selectedGenre === 'mystery' && sub.key === 'mystery_sub'))
                      .map((sub) => {
                      const active = selectedSubplotKeys.includes(sub.key)
                      const atLimit = selectedSubplotKeys.length >= 2 && !active
                      return (
                        <button
                          key={sub.key}
                          onClick={() => toggleSubplot(sub.key)}
                          disabled={atLimit}
                          className="text-xs px-2.5 py-1.5 rounded-full border transition-all duration-200 disabled:opacity-30"
                          style={{
                            background: active ? cfg.theme.primary + '22' : 'transparent',
                            borderColor: active ? cfg.theme.primary : cfg.theme.border,
                            color: active ? cfg.theme.primary : cfg.theme.textMuted,
                          }}
                        >
                          {sub.emoji} {sub.label}
                        </button>
                      )
                    })}
                  </div>
                  <button
                    onClick={handleStart}
                    className="w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:brightness-110 active:scale-[0.98]"
                    style={{
                      background: cfg.theme.primary,
                      color: '#fff',
                      boxShadow: `0 0 16px ${cfg.theme.primary}44`,
                    }}
                  >
                    开始冒险 →
                  </button>
                </div>
              </div>
            </div>
          )
        })}

        {/* 随机按钮 */}
        <button
          onClick={() => {
            const randomKey = getRandomGenre()
            setSelectedGenre(randomKey)
            setSelectedSubplotKeys([])
          }}
          onMouseEnter={() => handleHover('random')}
          onMouseLeave={() => handleHover(null)}
          className="group relative flex flex-col items-center justify-center gap-2 rounded-2xl p-5 transition-all duration-300 hover:scale-[1.05] active:scale-[0.96] overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px dashed rgba(255,255,255,0.15)',
            animationDelay: '0.48s',
            animationFillMode: 'backwards',
            opacity: selectedGenre ? 0.4 : 1,
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
