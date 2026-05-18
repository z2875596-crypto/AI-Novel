'use client'

import { useSettingsStore } from '@/stores/settingsStore'
import { stop } from '@/lib/tts'
import { useGenreStore } from '@/stores/genreStore'
import { GENRE_CONFIG } from '@/lib/themeConfig'

export default function TTSToggle() {
  const genre = useGenreStore((s) => s.genre)
  const ttsEnabled = useSettingsStore((s) => s.ttsEnabled)
  const setTtsEnabled = useSettingsStore((s) => s.setTtsEnabled)

  if (!genre) return null
  const config = GENRE_CONFIG[genre]

  function handleToggle() {
    if (ttsEnabled) {
      stop()
    }
    setTtsEnabled(!ttsEnabled)
  }

  return (
    <button
      onClick={handleToggle}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all hover:brightness-110 active:scale-95"
      style={{
        background: ttsEnabled
          ? config.theme.primary + '33'
          : 'rgba(255,255,255,0.06)',
        color: ttsEnabled ? config.theme.primary : config.theme.textMuted,
        border: `1px solid ${ttsEnabled ? config.theme.primary + '66' : config.theme.border}`,
      }}
      title={ttsEnabled ? '关闭朗读' : '开启朗读'}
    >
      <span>{ttsEnabled ? '🔊' : '🔇'}</span>
      <span>{ttsEnabled ? '朗读中' : '朗读'}</span>
    </button>
  )
}