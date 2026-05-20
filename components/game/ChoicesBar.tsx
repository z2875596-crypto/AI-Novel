'use client'

import { useGameStore } from '@/stores/gameStore'
import { useGenreStore } from '@/stores/genreStore'
import { GENRE_CONFIG } from '@/lib/themeConfig'
import { useWorldStore } from '@/stores/worldStore'

interface Props {
  onChoice: (choice: string) => void
}

export default function ChoicesBar({ onChoice }: Props) {
  const choices = useGameStore((s) => s.currentChoices)
  const isStreaming = useGameStore((s) => s.isStreaming)
  const genre = useGenreStore((s) => s.genre)
  const worldConfig = useWorldStore((s) => s.worldConfig)

  if (!genre || choices.length === 0 || isStreaming) return null
  const config = GENRE_CONFIG[genre]

  return (
    <div className="space-y-2">
      <p className="text-xs" style={{ color: config.theme.textMuted }}>
        选择{worldConfig.protagonistName}的行动：
      </p>
      <div className="grid gap-2">
        {choices.map((choice, i) => (
          <button
            key={i}
            onClick={() => onChoice(choice)}
            className="text-left px-4 py-3 rounded-xl border text-sm transition-all hover:brightness-125 active:scale-[0.98]"
            style={{
              background: config.theme.surface,
              borderColor: config.theme.border,
              color: config.theme.text,
            }}
          >
            <span style={{ color: config.theme.primary }} className="mr-2 font-bold">
              {['A', 'B', 'C', 'D'][i]}.
            </span>
            {choice}
          </button>
        ))}
      </div>
    </div>
  )
}