'use client'

import { SaveRecord } from '@/types/save'
import { GENRE_CONFIG } from '@/lib/themeConfig'

interface Props {
  save: SaveRecord
  onContinue: (save: SaveRecord) => void
  onDelete: (id: string) => void
}

export default function SaveCard({ save, onContinue, onDelete }: Props) {
  const config = GENRE_CONFIG[save.genre]
  const date = new Date(save.updatedAt).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div
      className="rounded-xl border p-4 flex items-center justify-between gap-4"
      style={{
        background: config.theme.surface,
        borderColor: config.theme.border,
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-2xl flex-shrink-0">{config.emoji}</span>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="font-semibold text-sm truncate"
              style={{ color: config.theme.text }}
            >
              {save.storyTitle}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
              style={{
                background: config.theme.primary + '33',
                color: config.theme.primary,
              }}
            >
              {config.label}
            </span>
            {save.ending && (
              <span
                className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                style={{
                  background: '#FFD700' + '33',
                  color: '#FFD700',
                }}
              >
                {save.ending.type === 'good' ? '🌟 好结局' :
                 save.ending.type === 'bad' ? '💀 坏结局' :
                 save.ending.type === 'true' ? '✨ 真结局' : '🔮 隐藏结局'}
              </span>
            )}
          </div>
          <div
            className="text-xs mt-0.5"
            style={{ color: config.theme.textMuted }}
          >
            第 {save.chapter} 回 · 第 {save.turn} 回合 · {date}
          </div>
          {/* 状态栏快照 */}
          <div className="flex gap-3 mt-1.5 flex-wrap">
            {config.bars.map((bar) => (
              <span
                key={bar.key}
                className="text-xs"
                style={{ color: bar.color }}
              >
                {bar.label}: {save.statusSnapshot[bar.key] ?? 0}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 flex-shrink-0">
        <button
          onClick={() => onContinue(save)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:brightness-110 active:scale-95"
          style={{ background: config.theme.primary, color: '#fff' }}
        >
          继续
        </button>
        <button
          onClick={() => onDelete(save.id)}
          className="px-3 py-1.5 rounded-lg text-xs transition-all hover:opacity-70"
          style={{
            background: 'transparent',
            color: config.theme.textMuted,
            border: `1px solid ${config.theme.border}`,
          }}
        >
          删除
        </button>
      </div>
    </div>
  )
}