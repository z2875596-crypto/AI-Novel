'use client'

import { useRouter } from 'next/navigation'
import { useSummaryStore } from '@/stores/summaryStore'
import { useGenreStore } from '@/stores/genreStore'
import { useWorldStore } from '@/stores/worldStore'
import { useGameStore } from '@/stores/gameStore'
import { GENRE_CONFIG } from '@/lib/themeConfig'
import ThemeProvider from '@/components/shared/ThemeProvider'

export default function ChaptersPage() {
  const router = useRouter()
  const summaries = useSummaryStore((s) => s.summaries)
  const genre = useGenreStore((s) => s.genre)
  const worldConfig = useWorldStore((s) => s.worldConfig)
  const turn = useGameStore((s) => s.turn)

  if (!genre) {
    router.replace('/')
    return null
  }

  const config = GENRE_CONFIG[genre]
  const currentChapter = Math.floor(turn / 10) + 1

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
          style={{
            background: config.theme.surface,
            borderColor: config.theme.border,
          }}
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
          <div
            className="mt-3 text-xs px-3 py-1 rounded-full inline-block"
            style={{
              background: config.theme.primary + '22',
              color: config.theme.primary,
              border: `1px solid ${config.theme.primary}44`,
            }}
          >
            当前第 {currentChapter} 章
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
            <p className="text-xs mt-1 opacity-60">每 10 回合自动生成章节摘要</p>
          </div>
        ) : (
          <div className="space-y-4">
            {summaries.map((s, i) => (
              <div
                key={s.id}
                className="rounded-xl border p-5 animate-fade-in-up"
                style={{
                  background: config.theme.surface,
                  borderColor: config.theme.border,
                  animationDelay: `${i * 0.05}s`,
                }}
              >
                {/* 章节头 */}
                <div className="flex items-center gap-3 mb-3">
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
                  <div>
                    <p
                      className="text-xs"
                      style={{ color: config.theme.textMuted }}
                    >
                      第 {s.chapterNumber} 章
                    </p>
                    <p
                      className="text-base font-bold"
                      style={{ color: config.theme.text }}
                    >
                      {s.chapterTitle || `第${s.chapterNumber}章`}
                    </p>
                  </div>
                  <div
                    className="ml-auto text-xs"
                    style={{ color: config.theme.textMuted }}
                  >
                    第 {s.triggerTurn} 回合
                  </div>
                </div>

                {/* 分割线 */}
                <div
                  className="w-full h-px mb-3"
                  style={{ background: config.theme.border }}
                />

                {/* 摘要 */}
                <p
                  className="text-sm leading-relaxed italic"
                  style={{ color: config.theme.textMuted }}
                >
                  {s.content}
                </p>
              </div>
            ))}

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
                <div
                  className="ml-auto text-xs"
                  style={{ color: config.theme.textMuted }}
                >
                  第 {turn % 10}/10 回合
                </div>
              </div>
              <div
                className="mt-3 w-full h-1.5 rounded-full overflow-hidden"
                style={{ background: config.theme.primary + '22' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(turn % 10) * 10}%`,
                    background: config.theme.primary,
                    boxShadow: `0 0 8px ${config.theme.primary}88`,
                  }}
                />
              </div>
              <p className="text-xs mt-1.5 text-right" style={{ color: config.theme.textMuted }}>
                再 {10 - (turn % 10)} 回合解锁下一章摘要
              </p>
            </div>
          </div>
        )}
      </main>
    </ThemeProvider>
  )
}