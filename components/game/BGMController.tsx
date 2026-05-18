'use client'

import { useState, useEffect } from 'react'
import { useGenreStore } from '@/stores/genreStore'
import { GENRE_CONFIG } from '@/lib/themeConfig'
import { playBGM, stopBGM, setBGMVolume } from '@/lib/bgm'

export default function BGMController() {
  const genre = useGenreStore((s) => s.genre)
  const [enabled, setEnabled] = useState(false)
  const [volume, setVolume] = useState(0.6)
  const [showSlider, setShowSlider] = useState(false)

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
    <div className="relative flex items-center gap-1">
      {/* 音量滑块 */}
      {showSlider && enabled && (
        <div
          className="absolute bottom-full mb-2 right-0 px-3 py-2 rounded-xl border animate-fade-in-up"
          style={{
            background: config.theme.surface,
            borderColor: config.theme.border,
            minWidth: '120px',
          }}
        >
          <p className="text-xs mb-1.5" style={{ color: config.theme.textMuted }}>
            音量
          </p>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => handleVolume(Number(e.target.value))}
            className="w-full h-1 rounded-full appearance-none cursor-pointer"
            style={{ accentColor: config.theme.primary }}
          />
        </div>
      )}

      {/* BGM 开关按钮 */}
      <button
        onClick={handleToggle}
        onContextMenu={(e) => {
          e.preventDefault()
          if (enabled) setShowSlider(!showSlider)
        }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all hover:brightness-110 active:scale-95"
        style={{
          background: enabled
            ? config.theme.primary + '33'
            : 'rgba(255,255,255,0.06)',
          color: enabled ? config.theme.primary : config.theme.textMuted,
          border: `1px solid ${enabled ? config.theme.primary + '66' : config.theme.border}`,
        }}
        title={enabled ? '右键调节音量' : '开启背景音乐'}
      >
        <span>{enabled ? '🎵' : '🎵'}</span>
        <span>{enabled ? 'BGM' : 'BGM'}</span>
        {enabled && (
          <span
            className="inline-block w-1 h-1 rounded-full animate-pulse"
            style={{ background: config.theme.primary }}
          />
        )}
      </button>
    </div>
  )
}