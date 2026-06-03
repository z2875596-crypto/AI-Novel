'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSummaryStore } from '@/stores/summaryStore'
import { useGenreStore } from '@/stores/genreStore'
import { useWorldStore } from '@/stores/worldStore'
import { useGameStore } from '@/stores/gameStore'
import { STORY_LENGTH_CONFIG } from '@/types/world'
import { GENRE_CONFIG } from '@/lib/themeConfig'
import ThemeProvider from '@/components/shared/ThemeProvider'
import { Message } from '@/types/game'
import { GenreConfig } from '@/types/genre'

function MessageBubble({ msg, config }: { msg: Message; config: GenreConfig }) {
  if (msg.role === 'player') {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[80%] text-sm px-4 py-2.5 rounded-2xl rounded-tr-sm"
          style={{
            background: config.theme.primary + '22',
            color: config.theme.primary,
            border: `1px solid ${config.theme.primary}44`,
          }}
        >
          {msg.content}
        </div>
      </div>
    )
  }

  if (msg.role === 'narrator') {
    return (
      <div
        className="text-sm leading-relaxed rounded-xl px-4 py-3"
        style={{
          background: config.theme.surface,
          color: config.theme.text,
          borderLeft: `2px solid ${config.theme.primary}44`,
        }}
      >
        {msg.content}
      </div>
    )
  }

  return null
}

export default function ChaptersPage() {
  const router = useRouter()
  const summaries = useSummaryStore((s) => s.summaries)
  const genre = useGenreStore((s) => s.genre)
  const worldConfig = useWorldStore((s) => s.worldConfig)
  const turn = useGameStore((s) => s.turn)
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null)

  if (!genre) {
    router.replace('/')
    return null
  }

  const config = GENRE_CONFIG[genre]
  const storyLength = worldConfig.storyLength ?? 'medium'
  const { turnsPerChapter, totalTurns, totalChapters } = STORY_LENGTH_CONFIG[storyLength]
  const currentChapter = Math.floor(turn / turnsPerChapter) + 1
  const currentChapterProgress = turn % turnsPerChapter
  const overallProgress = Math.min((turn / totalTurns) * 100, 100)

  return (
    <ThemeProvider>
      <main className="min-h-screen px-4 py-10 max-w-2xl mx-auto">
        {/* 顶部 */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all hover:brightness-110"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: config.theme.textMuted,
              border: `1px solid ${config.theme.border}`,
            }}
          >
            ← 返回
          </button>
          <h1 className="text-xl font-bold" style={{ color: config.theme.text }}>
            📚 章节目录
          </h1>
          <div className="w-16" />
        </div>

        {/* 书名 */}
        <div
          className="text-center mb-8 p-6 rounded-2xl border"
          style={{ background: config.theme.surface, borderColor: config.theme.border }}
        >
          <p className="text-xs mb-1" style={{ color: config.theme.textMuted }}>
            {config.emoji} {config.label}
          </p>
          <h2 className="text-2xl font-bold mb-1" style={{ color: config.theme.text }}>
            {worldConfig.worldName}
          </h2>
          <p className="text-sm" style={{ color: config.theme.textMuted }}>
            主角：{worldConfig.protagonistName} · 共 {turn} 回合
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span
              className="text-xs px-3 py-1 rounded-full inline-block"
              style={{
                background: config.theme.primary + '22',
                color: config.theme.primary,
                border: `1px solid ${config.theme.primary}44`,
              }}
            >
              第 {currentChapter}/{totalChapters} 章
            </span>
            <span
              className="text-xs px-3 py-1 rounded-full inline-block"
              style={{
                background: config.theme.primary + '11',
                color: config.theme.textMuted,
                border: `1px solid ${config.theme.border}`,
              }}
            >
              整体 {Math.round(overallProgress)}%
            </span>
          </div>
          <div
            className="mt-3 w-full h-1 rounded-full overflow-hidden max-w-[200px] mx-auto"
            style={{ background: config.theme.primary + '22' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${overallProgress}%`,
                background: config.theme.primary,
                boxShadow: `0 0 8px ${config.theme.primary}88`,
              }}
            />
          </div>
        </div>

        {/* 章节列表 */}
        {summaries.length === 0 ? (
          <div
            className="text-center py-16 rounded-xl border"
            style={{
              borderColor: config.theme.border,
              background: config.theme.surface,
              color: config.theme.textMuted,
            }}
          >
            <p className="text-3xl mb-3">📖</p>
            <p className="text-sm">第一章尚未完成</p>
            <p className="text-xs mt-1 opacity-60">每 {turnsPerChapter} 回合自动生成章节摘要</p>
          </div>
        ) : (
          <div className="space-y-4">
            {summaries.map((s, i) => {
              const isExpanded = expandedChapter === s.id
              const hasMessages = s.messages && s.messages.length > 0

              return (
                <div
                  key={s.id}
                  className="rounded-xl border overflow-hidden animate-fade-in-up"
                  style={{
                    background: config.theme.surface,
                    borderColor: isExpanded ? config.theme.primary + '66' : config.theme.border,
                    animationDelay: `${i * 0.05}s`,
                    transition: 'border-color 0.2s',
                  }}
                >
                  {/* 章节头：点击展开/折叠 */}
                  <button
                    className="w-full text-left p-5 transition-all hover:brightness-110"
                    onClick={() => setExpandedChapter(isExpanded ? null : s.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{
                          background: config.theme.primary + '22',
                          color: config.theme.primary,
                          border: `1px solid ${config.theme.primary}44`,
                        }}
                      >
                        {s.chapterNumber}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs" style={{ color: config.theme.textMuted }}>
                          第 {s.chapterNumber} 章 · 第 {s.triggerTurn - turnsPerChapter + 1}–{s.triggerTurn} 回合
                        </p>
                        <p className="text-base font-bold truncate" style={{ color: config.theme.text }}>
                          {s.chapterTitle || `第${s.chapterNumber}章`}
                        </p>
                      </div>
                      {/* 展开箭头 */}
                      <span
                        className="text-xs flex-shrink-0 transition-transform duration-200"
                        style={{
                          color: config.theme.textMuted,
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          display: 'inline-block',
                        }}
                      >
                        ▾
                      </span>
                    </div>

                    {/* 摘要（始终可见） */}
                    <div
                      className="w-full h-px mt-3 mb-3"
                      style={{ background: config.theme.border }}
                    />
                    <p
                      className="text-sm leading-relaxed italic"
                      style={{ color: config.theme.textMuted }}
                    >
                      {s.content}
                    </p>

                    {hasMessages && (
                      <p
                        className="text-xs mt-2"
                        style={{ color: config.theme.primary + 'aa' }}
                      >
                        {isExpanded ? '收起对话 ↑' : `查看 ${s.messages.length} 条对话 ↓`}
                      </p>
                    )}
                  </button>

                  {/* 展开的对话内容 */}
                  {isExpanded && hasMessages && (
                    <div
                      className="px-5 pb-5 space-y-3 border-t"
                      style={{ borderColor: config.theme.border }}
                    >
                      <p
                        className="text-xs pt-4 mb-3 font-semibold tracking-wider uppercase"
                        style={{ color: config.theme.primary }}
                      >
                        本章对话记录
                      </p>
                      {s.messages.map((msg) => (
                        <MessageBubble key={msg.id} msg={msg} config={config} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            {/* 当前章节（进行中） */}
            <div
              className="rounded-xl border border-dashed p-5"
              style={{
                borderColor: config.theme.primary + '44',
                background: config.theme.primary + '08',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 animate-pulse"
                  style={{
                    background: config.theme.primary + '22',
                    color: config.theme.primary,
                    border: `1px solid ${config.theme.primary}66`,
                  }}
                >
                  {currentChapter}
                </div>
                <div>
                  <p className="text-xs" style={{ color: config.theme.textMuted }}>
                    第 {currentChapter} 章 · 进行中
                  </p>
                  <p className="text-sm font-bold" style={{ color: config.theme.primary }}>
                    故事继续…
                  </p>
                </div>
                <div className="ml-auto text-xs" style={{ color: config.theme.textMuted }}>
                  {currentChapterProgress}/{turnsPerChapter} 回合
                </div>
              </div>
              <div
                className="mt-3 w-full h-1.5 rounded-full overflow-hidden"
                style={{ background: config.theme.primary + '22' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(currentChapterProgress / turnsPerChapter) * 100}%`,
                    background: config.theme.primary,
                    boxShadow: `0 0 8px ${config.theme.primary}88`,
                  }}
                />
              </div>
              <p className="text-xs mt-1.5 text-right" style={{ color: config.theme.textMuted }}>
                再 {turnsPerChapter - currentChapterProgress} 回合解锁下一章摘要
              </p>
            </div>
          </div>
        )}
      </main>
    </ThemeProvider>
  )
}
