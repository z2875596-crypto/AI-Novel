'use client'

import { useGenreStore } from '@/stores/genreStore'
import { GENRE_CONFIG } from '@/lib/themeConfig'
import { Message } from '@/types/game'

interface Props {
  messages: Message[]
  currentTurn: number
  onRewind: (turn: number, messages: Message[]) => void
  onClose: () => void
}

export default function RewindModal({ messages, currentTurn, onRewind, onClose }: Props) {
  const genre = useGenreStore((s) => s.genre)
  const config = genre ? GENRE_CONFIG[genre] : null

  const primary = config?.theme.primary ?? '#888'
  const border = config?.theme.border ?? 'rgba(255,255,255,0.1)'
  const surface = config?.theme.surface ?? '#1a1a1a'
  const text = config?.theme.text ?? '#fff'
  const textMuted = config?.theme.textMuted ?? '#888'

  // 只取 narrator 类型的消息作为回溯节点（每条叙述都是一个分叉点）
  const narratorMessages = messages
    .filter((m) => m.role === 'narrator' && m.turn !== undefined)
    .slice(0, -1)  // 排除最后一条（当前节点，无意义回溯）
    .reverse()     // 最近的在最上面

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full max-w-md rounded-2xl border overflow-hidden animate-fade-in-up"
        style={{ background: surface, borderColor: border }}
      >
        {/* 头부 */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: border }}>
          <div>
            <h2 className="text-base font-bold" style={{ color: text }}>↩️ 回溯改写</h2>
            <p className="text-xs mt-0.5" style={{ color: textMuted }}>
              选择一个节点，从那里重新开始新分支
            </p>
          </div>
          <button onClick={onClose} className="text-lg opacity-50 hover:opacity-100" style={{ color: text }}>✕</button>
        </div>

        {/* 提示 */}
        <div
          className="mx-4 mt-3 px-3 py-2 rounded-lg text-xs"
          style={{ background: primary + '15', border: `1px solid ${primary}33`, color: primary }}
        >
          ⚡ 回溯会创建新的分支存档，原主线进度完整保留
        </div>

        {/* 节点列表 */}
        <div className="p-4 max-h-80 overflow-y-auto space-y-2">
          {narratorMessages.length === 0 ? (
            <p className="text-center py-8 text-sm" style={{ color: textMuted }}>
              暂无可回溯的节点
            </p>
          ) : (
            narratorMessages.map((msg) => {
              const turn = msg.turn!
              const messagesUpToHere = messages.filter(
                (m) => (m.turn ?? 0) <= turn && m.role !== 'summary'
              )
              return (
                <button
                  key={msg.id}
                  onClick={() => onRewind(turn, messagesUpToHere)}
                  className="w-full text-left rounded-xl border p-3 transition-all hover:brightness-125 group"
                  style={{ borderColor: border, background: 'rgba(255,255,255,0.03)' }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: primary + '22', color: primary }}
                    >
                      第 {turn} 回合
                    </span>
                    <span
                      className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: primary }}
                    >
                      从这里分叉 →
                    </span>
                  </div>
                  <p
                    className="text-xs leading-relaxed line-clamp-2"
                    style={{ color: textMuted }}
                  >
                    {msg.content.slice(0, 80)}…
                  </p>
                </button>
              )
            })
          )}
        </div>

        <div className="px-4 py-3 border-t" style={{ borderColor: border }}>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm border transition-all hover:brightness-110"
            style={{ borderColor: border, color: textMuted }}
          >
            取消
          </button>
        </div>
      </div>
    </div>
  )
}
