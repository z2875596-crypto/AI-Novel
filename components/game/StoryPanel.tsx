'use client'

import { useEffect, useRef, useState } from 'react'
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

  const followBottom = useRef(true)
  const [showLatest, setShowLatest] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const config = genre ? GENRE_CONFIG[genre] : null

  const currentChoices = useGameStore((s) => s.currentChoices)

  useEffect(() => {
    if (followBottom.current) bottomRef.current?.scrollIntoView({ behavior: 'instant', block: 'end' })
  }, [messages, streamingText, currentChoices])

  return (
    <div
      onScroll={e => { const el = e.currentTarget; followBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 100; setShowLatest(!followBottom.current) }}
      className="relative flex-1 rounded-2xl border p-5 overflow-y-auto min-h-0"
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
            {msg.role === 'narrator' && (
              <div
                className="px-3 py-3 text-base leading-8 whitespace-pre-wrap"
                style={{
                  background: `linear-gradient(135deg, ${config?.theme.surface ?? '#1a1a1a'}ee, ${config?.theme.surface ?? '#1a1a1a'})`,
                  color: config?.theme.text ?? '#fff',
                  borderLeft: `2px solid ${config?.theme.primary ?? '#888'}44`,
                }}
              >
                {msg.content}
              </div>
            )}

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

        {/* 打字机流式输出 */}
        {isStreaming && streamingText && (
          <div className="animate-fade-in">
            <div
              className="px-3 py-3 text-base leading-8 whitespace-pre-wrap"
              style={{
                background: `linear-gradient(135deg, ${config?.theme.surface ?? '#1a1a1a'}ee, ${config?.theme.surface ?? '#1a1a1a'})`,
                color: config?.theme.text ?? '#fff',
                borderLeft: `2px solid ${config?.theme.primary ?? '#888'}66`,
                boxShadow: `0 0 20px ${config?.theme.primary ?? '#888'}11`,
              }}
            >
              {streamingText}
              {/* 打字光标：打字中常亮，等待时闪烁 */}
              <span
                className="inline-block w-0.5 h-4 ml-0.5 align-middle rounded-full"
                style={{
                  background: config?.theme.primary ?? '#fff',
                  boxShadow: `0 0 6px ${config?.theme.primary ?? '#fff'}`,
                  animation: 'blink 1s step-end infinite',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {showLatest && <button className="sticky bottom-0 float-right rounded-full px-3 py-2 text-xs" style={{ background: config?.theme.primary, color: "#fff" }} onClick={() => { followBottom.current = true; setShowLatest(false); bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }) }}>回到最新</button>}
      <div ref={bottomRef} />
    </div>
  )
}
