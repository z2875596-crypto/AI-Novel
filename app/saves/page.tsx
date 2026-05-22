'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSaveStore } from '@/stores/saveStore'
import { useGameStore } from '@/stores/gameStore'
import { useGenreStore } from '@/stores/genreStore'
import { useWorldStore } from '@/stores/worldStore'
import { useSummaryStore } from '@/stores/summaryStore'
import { SaveRecord } from '@/types/save'
import ThemeProvider from '@/components/shared/ThemeProvider'
import SaveCard from '@/components/saves/SaveCard'
import { exportNovelAsText, downloadText } from '@/lib/exportNovel'
import { GENRE_CONFIG } from '@/lib/themeConfig'

const ENDING_CONFIG = {
  good:   { icon: '🌟', label: '好结局', color: '#FFD700' },
  bad:    { icon: '💀', label: '坏结局', color: '#CC2222' },
  true:   { icon: '✨', label: '真结局', color: '#9B59B6' },
  secret: { icon: '🔮', label: '隐藏结局', color: '#00F5D4' },
}

export default function SavesPage() {
  const router = useRouter()
  const { saves, loadFromStorage, remove } = useSaveStore()
  const resetGame = useGameStore((s) => s.resetGame)
  const setMessages = useGameStore((s) => s.setMessages)
  const setGenre = useGenreStore((s) => s.setGenre)
  const setWorldConfig = useWorldStore((s) => s.setWorldConfig)
  const resetSummaries = useSummaryStore((s) => s.reset)
  const [tab, setTab] = useState<'saves' | 'endings'>('saves')

  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])

  const endingSaves = saves.filter((s) => s.ending)
  const normalSaves = saves.filter((s) => !s.ending)

  function handleContinue(save: SaveRecord) {
    setGenre(save.genre)
    setWorldConfig(save.worldConfig)
    resetGame(save.statusSnapshot)
    setMessages(save.recentHistory)
    resetSummaries()
    useGameStore.setState({ turn: save.turn, status: save.statusSnapshot })
    router.push('/game')
  }

  function handleDelete(id: string) {
    if (confirm('确定删除这条存档吗？')) remove(id)
  }

  function handleExport(save: SaveRecord) {
    const content = exportNovelAsText(save)
    const filename = `${save.worldConfig.worldName}-${save.worldConfig.protagonistName}.txt`
    downloadText(content, filename)
  }

  return (
    <ThemeProvider>
      <main className="min-h-screen px-4 py-10 max-w-2xl mx-auto">
        {/* 顶部 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all hover:brightness-110"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: 'var(--theme-text-muted)',
              border: '1px solid var(--theme-border)',
            }}
          >
            ← 主页
          </button>
          <h1 className="text-xl font-bold" style={{ color: 'var(--theme-text)' }}>
            我的故事
          </h1>
          <div className="w-16" />
        </div>

        {/* Tab 切换 */}
        <div
          className="flex rounded-xl overflow-hidden border mb-6"
          style={{ borderColor: 'var(--theme-border)' }}
        >
          <button
            onClick={() => setTab('saves')}
            className="flex-1 py-2.5 text-sm font-medium transition-all"
            style={{
              background: tab === 'saves' ? 'var(--theme-primary)22' : 'transparent',
              color: tab === 'saves' ? 'var(--theme-primary)' : 'var(--theme-text-muted)',
              borderRight: '1px solid var(--theme-border)',
            }}
          >
            📂 存档列表
            {normalSaves.length > 0 && (
              <span className="ml-1.5 text-xs opacity-60">({normalSaves.length})</span>
            )}
          </button>
          <button
            onClick={() => setTab('endings')}
            className="flex-1 py-2.5 text-sm font-medium transition-all"
            style={{
              background: tab === 'endings' ? 'var(--theme-primary)22' : 'transparent',
              color: tab === 'endings' ? 'var(--theme-primary)' : 'var(--theme-text-muted)',
            }}
          >
            🏆 结局画廊
            {endingSaves.length > 0 && (
              <span className="ml-1.5 text-xs opacity-60">({endingSaves.length})</span>
            )}
          </button>
        </div>

        {/* 存档列表 */}
        {tab === 'saves' && (
          <>
            {saves.length === 0 ? (
              <div
                className="text-center py-20 rounded-xl border"
                style={{
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text-muted)',
                }}
              >
                <p className="text-4xl mb-4">📭</p>
                <p className="text-sm">还没有存档，去开始一个故事吧！</p>
                <button
                  onClick={() => router.push('/')}
                  className="mt-4 px-4 py-2 rounded-lg text-sm transition-all hover:brightness-110"
                  style={{ background: 'var(--theme-primary)', color: '#fff' }}
                >
                  去首页
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {saves.map((save) => (
                  <SaveCard
                    key={save.id}
                    save={save}
                    onContinue={handleContinue}
                    onDelete={handleDelete}
                    onExport={handleExport}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* 结局画廊 */}
        {tab === 'endings' && (
          <>
            {endingSaves.length === 0 ? (
              <div
                className="text-center py-20 rounded-xl border"
                style={{
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text-muted)',
                }}
              >
                <p className="text-4xl mb-4">🎭</p>
                <p className="text-sm">还没有解锁任何结局</p>
                <p className="text-xs mt-2 opacity-60">
                  在设定页填写「目标结局」，AI 会引导故事走向该结局
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="mt-4 px-4 py-2 rounded-lg text-sm transition-all hover:brightness-110"
                  style={{ background: 'var(--theme-primary)', color: '#fff' }}
                >
                  开始新故事
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {endingSaves.map((save, i) => {
                  const config = GENRE_CONFIG[save.genre]
                  const ending = save.ending!
                  const endingCfg = ENDING_CONFIG[ending.type]
                  const date = new Date(ending.unlockedAt).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })

                  return (
                    <div
                      key={save.id}
                      className="rounded-2xl border p-6 animate-fade-in-up relative overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${config.theme.surface}, ${endingCfg.color}11)`,
                        borderColor: `${endingCfg.color}44`,
                        boxShadow: `0 0 30px ${endingCfg.color}11`,
                        animationDelay: `${i * 0.08}s`,
                      }}
                    >
                      {/* 背景装饰 */}
                      <div
                        className="absolute top-0 right-0 text-8xl opacity-5 pointer-events-none select-none"
                        style={{ lineHeight: 1 }}
                      >
                        {endingCfg.icon}
                      </div>

                      {/* 结局类型徽章 */}
                      <div className="flex items-center gap-2 mb-4">
                        <span
                          className="text-xs px-3 py-1 rounded-full font-bold"
                          style={{
                            background: `${endingCfg.color}22`,
                            color: endingCfg.color,
                            border: `1px solid ${endingCfg.color}44`,
                          }}
                        >
                          {endingCfg.icon} {endingCfg.label}
                        </span>
                        <span
                          className="text-xs px-2 py-1 rounded-full"
                          style={{
                            background: `${config.theme.primary}22`,
                            color: config.theme.primary,
                          }}
                        >
                          {config.emoji} {config.label}
                        </span>
                      </div>

                      {/* 结局标题 */}
                      <h3
                        className="text-xl font-bold mb-1"
                        style={{ color: endingCfg.color }}
                      >
                        {ending.title}
                      </h3>

                      {/* 故事信息 */}
                      <p className="text-sm mb-1" style={{ color: config.theme.text }}>
                        {save.worldConfig.worldName} · {save.worldConfig.protagonistName}
                      </p>
                      <p className="text-xs mb-4" style={{ color: config.theme.textMuted }}>
                        共 {save.turn} 回合 · 第 {save.chapter} 章 · {date} 解锁
                      </p>

                      {/* 操作按钮 */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleContinue(save)}
                          className="px-4 py-2 rounded-lg text-xs font-medium transition-all hover:brightness-110"
                          style={{
                            background: endingCfg.color,
                            color: '#fff',
                          }}
                        >
                          重温故事
                        </button>
                        <button
                          onClick={() => handleExport(save)}
                          className="px-4 py-2 rounded-lg text-xs transition-all hover:brightness-110"
                          style={{
                            background: 'rgba(255,255,255,0.06)',
                            color: config.theme.textMuted,
                            border: `1px solid ${config.theme.border}`,
                          }}
                        >
                          导出小说
                        </button>
                        <button
                          onClick={() => handleDelete(save.id)}
                          className="px-4 py-2 rounded-lg text-xs transition-all hover:opacity-70"
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
                })}
              </div>
            )}
          </>
        )}
      </main>
    </ThemeProvider>
  )
}