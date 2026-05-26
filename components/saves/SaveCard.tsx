'use client'

import { SaveRecord } from '@/types/save'
import { GENRE_CONFIG } from '@/lib/themeConfig'
import SaveCover from './SaveCover'

interface Props {
  save: SaveRecord
  onContinue: (save: SaveRecord) => void
  onDelete: (id: string) => void
  onExport: (save: SaveRecord) => void
}

export default function SaveCard({ save, onContinue, onDelete, onExport }: Props) {
  const config = GENRE_CONFIG[save.genre]
  const date = new Date(save.updatedAt).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div
      className="rounded-xl border p-4 flex items-center gap-4"
      style={{
        background: config.theme.surface,
        borderColor: config.theme.border,
      }}
    >
      {/* 封面 */}
      <SaveCover
        genre={save.genre}
        worldName={save.worldConfig.worldName}
        protagonistName={save.worldConfig.protagonistName}
        chapter={save.chapter}
      />

      {/* 信息 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
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
          {save.isBranch && (
            <span
              className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
              style={{
                background: '#7B68EE33',
                color: '#9B8EFF',
                border: '1px solid #7B68EE44',
              }}
            >
              ↩️ 分支
            </span>
          )}
          {save.ending && (
            <span
              className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
              style={{
                background: '#FFD70033',
                color: '#FFD700',
              }}
            >
              {save.ending.type === 'good' ? '🌟 好结局' :
               save.ending.type === 'bad' ? '💀 坏结局' :
               save.ending.type === 'true' ? '✨ 真结局' : '🔮 隐藏结局'}
            </span>
          )}
        </div>

        <div className="text-xs mb-1.5" style={{ color: config.theme.textMuted }}>
          第 {save.chapter} 章 · 第 {save.turn} 回合 · {date}
        </div>

        <div className="flex gap-3 flex-wrap mb-3">
          {config.bars.map((bar) => (
            <span key={bar.key} className="text-xs" style={{ color: bar.color }}>
              {bar.label}: {save.statusSnapshot[bar.key] ?? 0}
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onContinue(save)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:brightness-110 active:scale-95"
            style={{ background: config.theme.primary, color: '#fff' }}
          >
            继续
          </button>
          <button
            onClick={() => onExport(save)}
            className="px-3 py-1.5 rounded-lg text-xs transition-all hover:brightness-110 active:scale-95"
            style={{
              background: 'transparent',
              color: config.theme.textMuted,
              border: `1px solid ${config.theme.border}`,
            }}
          >
            导出
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
    </div>
  )
}
