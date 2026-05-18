'use client'

import { useEffect, useRef } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { useGenreStore } from '@/stores/genreStore'
import { useSummaryStore } from '@/stores/summaryStore'
import { GENRE_CONFIG } from '@/lib/themeConfig'
import SummaryCard from './SummaryCard'

export default function StoryPanel() {
  const messages = useGameStore((s) => s.messages)
  const streamingText = useGameStore((s) => s.streamingText)
  const isStreaming = useGameStore((s) => s.isStreaming)
  const genre = useGenreStore((s) => s.genre)
  const summaries = useSummaryStore((s) => s.summaries)
  const bottomRef = useRef<HTMLDivElement>(null)

  const config = genre ? GENRE_CONFIG[genre] : null

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  return (
    <div
      className="flex-1 rounded-2xl border p-5 overflow-y-auto min-h-0"
      style={{
        background: config?.theme.surface ?? 'rgba(255,255,255,0.04)',
        borderColor: config?.theme.border ?? 'rgba(255,255,255,0.1)',
        boxShadow: `inset 0 1px 0 ${config?.theme.primary ?? '#fff'}11`,
      }}
    >
      {messages.length === 0 && !isStreaming && (
        <div className="flex flex-col items-center justify-center h-full gap-3 animate-fade-in">
          <span className="text-4xl animate-float">{config?.emoji ?? '📖'}</span>
          <p className="text-sm text-center" style={{ color: config?.theme.textMuted ?? '#888' }}>
            故事即将开始…
          </p>
        </div>
      )}

      {/* 历史摘要 */}
      {summaries.length > 0 && (
        <div className="space-y-2 mb-4">
          {summaries.map((summary) => (
            <SummaryCard key={summary.id} summary={summary} />
          ))}
        </div>
      )}

      <div className="space-y-4">
        {messages.map((msg, i) => (
          <div
            key={msg.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${Math.min(i * 0.05, 0.3)}s` }}
          >
            {/* 旁白/剧情 */}
            {msg.role === 'narrator' && (
              <div
                className="rounded-xl p-4 text-sm leading-relaxed"
                style={{
                  background: `linear-gradient(135deg, ${config?.theme.surface ?? '#1a1a1a'}ee, ${config?.theme.surface ?? '#1a1a1a'})`,
                  color: config?.theme.text ?? '#fff',
                  borderLeft: `2px solid ${config?.theme.primary ?? '#888'}44`,
                }}
              >
                {msg.content}
              </div>
            )}

            {/* 玩家选择 */}
            {msg.role === 'player' && (
              <div className="flex justify-end animate-slide-in-right">
                <div
                  className="max-w-[80%] text-sm px-4 py-2.5 rounded-2xl rounded-tr-sm font-medium"
                  style={{
                    background: `linear-gradient(135deg, ${config?.theme.primary ?? '#888'}22, ${config?.theme.primary ?? '#888'}33)`,
                    color: config?.theme.primary ?? '#aaa',
                    border: `1px solid ${config?.theme.primary ?? '#888'}44`,
                    boxShadow: `0 2px 12px ${config?.theme.primary ?? '#888'}22`,
                  }}
                >
                  {msg.content}
                </div>
              </div>
            )}

            {/* 摘要消息 */}
            {msg.role === 'summary' && (
              <div
                className="rounded-xl p-4 text-xs leading-relaxed italic"
                style={{
                  borderLeft: `3px solid ${config?.theme.primary ?? '#888'}`,
                  color: config?.theme.textMuted ?? '#888',
                  background: `linear-gradient(135deg, ${config?.theme.primary ?? '#888'}0a, transparent)`,
                }}
              >
                <span
                  className="font-semibold not-italic block mb-1.5 text-xs tracking-wider uppercase"
                  style={{ color: config?.theme.primary }}
                >
                  📖 故事回顾
                </span>
                {msg.content}
              </div>
            )}
          </div>
        ))}

        {/* 流式输出 */}
        {isStreaming && streamingText && (
          <div className="animate-fade-in">
            <div
              className="rounded-xl p-4 text-sm leading-relaxed"
              style={{
                background: `linear-gradient(135deg, ${config?.theme.surface ?? '#1a1a1a'}ee, ${config?.theme.surface ?? '#1a1a1a'})`,
                color: config?.theme.text ?? '#fff',
                borderLeft: `2px solid ${config?.theme.primary ?? '#888'}66`,
                boxShadow: `0 0 20px ${config?.theme.primary ?? '#888'}11`,
              }}
            >
              {streamingText}
              <span
                className="inline-block w-0.5 h-4 ml-0.5 align-middle cursor-blink rounded-full"
                style={{
                  background: config?.theme.primary ?? '#fff',
                  boxShadow: `0 0 6px ${config?.theme.primary ?? '#fff'}`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div ref={bottomRef} />
    </div>
  )
}