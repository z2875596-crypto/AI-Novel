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
      className="flex-1 rounded-xl border p-5 overflow-y-auto space-y-5 min-h-0"
      style={{
        background: config?.theme.surface ?? 'rgba(255,255,255,0.04)',
        borderColor: config?.theme.border ?? 'rgba(255,255,255,0.1)',
      }}
    >
      {messages.length === 0 && !isStreaming && (
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-center" style={{ color: config?.theme.textMuted ?? '#888' }}>
            故事即将开始…
          </p>
        </div>
      )}

      {/* 历史摘要列表（侧边栏预览） */}
      {summaries.length > 0 && (
        <div className="space-y-2">
          {summaries.map((summary) => (
            <SummaryCard key={summary.id} summary={summary} />
          ))}
        </div>
      )}

      {messages.map((msg) => (
        <div key={msg.id} className="animate-fade-in-up">
          {msg.role === 'narrator' && (
            <p className="text-sm leading-relaxed" style={{ color: config?.theme.text ?? '#fff' }}>
              {msg.content}
            </p>
          )}
          {msg.role === 'player' && (
            <div className="flex justify-end">
              <div
                className="max-w-[80%] text-sm px-4 py-2 rounded-xl rounded-tr-sm"
                style={{
                  background: (config?.theme.primary ?? '#888') + '33',
                  color: config?.theme.primary ?? '#aaa',
                  border: `1px solid ${config?.theme.primary ?? '#888'}44`,
                }}
              >
                {msg.content}
              </div>
            </div>
          )}
          {msg.role === 'summary' && (
            <div
              className="border-l-2 pl-4 py-2 rounded-r-lg text-xs leading-relaxed italic"
              style={{
                borderColor: config?.theme.primary ?? '#888',
                color: config?.theme.textMuted ?? '#888',
                background: (config?.theme.primary ?? '#888') + '11',
              }}
            >
              <span
                className="font-semibold not-italic block mb-1"
                style={{ color: config?.theme.primary }}
              >
                📖 故事回顾
              </span>
              {msg.content}
            </div>
          )}
        </div>
      ))}

      {isStreaming && streamingText && (
        <div className="animate-fade-in-up">
          <p className="text-sm leading-relaxed" style={{ color: config?.theme.text ?? '#fff' }}>
            {streamingText}
            <span
              className="inline-block w-0.5 h-4 ml-0.5 align-middle cursor-blink"
              style={{ background: config?.theme.primary ?? '#fff' }}
            />
          </p>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}