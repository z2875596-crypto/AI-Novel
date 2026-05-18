'use client'

import { useState, useEffect } from 'react'
import { useGenreStore } from '@/stores/genreStore'
import { GENRE_CONFIG } from '@/lib/themeConfig'
import { playBGM, stopBGM, setBGMVolume } from '@/lib/bgm'

export default function BGMController() {
  const genre = useGenreStore((s) => s.genre)
  const [enabled, setEnabled] = useState(false)
  const [volume, setVolume] = useState(0.6)

  if (!genre) return null
  const config = GENRE_CONFIG[genre]

  useEffect(() => {
    return () => stopBGM()
  }, [])

  function handleToggle() {
    if (enabled) {
      stopBGM()
      setEnabled(false)
    } else {
      playBGM(genre!)
      setEnabled(true)
    }
  }

  function handleVolume(v: number) {
    setVolume(v)
    setBGMVolume(v)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggle}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all hover:brightness-110 active:scale-95"
        style={{
          background: enabled ? config.theme.primary + '33' : 'rgba(255,255,255,0.06)',
          color: enabled ? config.theme.primary : config.theme.textMuted,
          border: `1px solid ${enabled ? config.theme.primary + '66' : config.theme.border}`,
        }}
      >
        <span>🎵</span>
        <span>BGM</span>
        {enabled && (
          <span
            className="inline-block w-1 h-1 rounded-full animate-pulse"
            style={{ background: config.theme.primary }}
          />
        )}
      </button>

      {enabled && (
        <div className="flex items-center gap-1.5 animate-fade-in">
          <span className="text-xs" style={{ color: config.theme.textMuted }}>🔈</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => handleVolume(Number(e.target.value))}
            style={{
              accentColor: config.theme.primary,
              width: '72px',
              height: '4px',
              borderRadius: '2px',
              cursor: 'pointer',
              background: `linear-gradient(to right, ${config.theme.primary} ${volume * 100}%, ${config.theme.border} ${volume * 100}%)`,
              appearance: 'none',
              WebkitAppearance: 'none',
              outline: 'none',
              border: 'none',
            }}
          />
          <span className="text-xs" style={{ color: config.theme.textMuted }}>🔊</span>
        </div>
      )}
    </div>
  )
}