'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useClueStore } from '@/stores/clueStore'
import { useGenreStore } from '@/stores/genreStore'
import ThemeProvider from '@/components/shared/ThemeProvider'
import ClueCard from '@/components/clues/ClueCard'
import ClueGraph from '@/components/clues/ClueGraph'

export default function CluesPage() {
  const router = useRouter()
  const clues = useClueStore((s) => s.clues)
  const genre = useGenreStore((s) => s.genre)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [view, setView] = useState<'list' | 'graph'>('list')

  const selectedClue = clues.find((c) => c.id === selectedId) ?? null
  const relatedIds = selectedClue?.relatedClues ?? []

  function handleSelect(id: string) {
    setSelectedId(id === selectedId ? null : id || null)
  }

  return (
    <ThemeProvider>
      <main
        className="min-h-screen px-4 py-10 max-w-3xl mx-auto"
        style={{ color: '#e8e0c8' }}
      >
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all hover:brightness-110"
            style={{
              background: 'rgba(20,20,16,0.9)',
              color: '#8a8070',
              border: '1px solid rgba(58,53,32,0.8)',
            }}
          >
            ← 返回
          </button>

          <div className="flex items-center gap-2">
            <span className="text-lg">🔍</span>
            <h1 className="text-xl font-bold" style={{ color: '#e8e0c8' }}>
              线索库
            </h1>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: 'rgba(184,150,12,0.2)',
                color: '#B8960C',
                border: '1px solid rgba(184,150,12,0.3)',
              }}
            >
              {clues.length} 条
            </span>
          </div>

          {/* 视图切换 */}
          <div
            className="flex rounded-lg overflow-hidden border"
            style={{ borderColor: 'rgba(58,53,32,0.8)' }}
          >
            {(['list', 'graph'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="px-3 py-1.5 text-xs transition-all"
                style={{
                  background: view === v ? 'rgba(184,150,12,0.2)' : 'rgba(20,20,16,0.9)',
                  color: view === v ? '#B8960C' : '#8a8070',
                }}
              >
                {v === 'list' ? '📋 列表' : '🕸️ 关联图'}
              </button>
            ))}
          </div>
        </div>

        {clues.length === 0 ? (
          <div
            className="text-center py-20 rounded-xl border"
            style={{
              borderColor: 'rgba(58,53,32,0.8)',
              background: 'rgba(10,10,8,0.9)',
              color: '#8a8070',
            }}
          >
            <p className="text-4xl mb-4">🌫️</p>
            <p className="text-sm">尚未发现任何线索</p>
            <p className="text-xs mt-2 opacity-60">继续调查，线索会自动出现在这里</p>
          </div>
        ) : (
          <>
            {view === 'graph' && (
              <div className="mb-6">
                <ClueGraph
                  clues={clues}
                  selectedId={selectedId}
                  onSelect={handleSelect}
                />
                {selectedClue && (
                  <div
                    className="mt-3 rounded-xl border p-4 animate-fade-in-up"
                    style={{
                      background: 'rgba(184,150,12,0.08)',
                      borderColor: 'rgba(184,150,12,0.3)',
                    }}
                  >
                    <p className="text-sm font-semibold mb-1" style={{ color: '#B8960C' }}>
                      {CLUE_CATEGORY_ICONS_INLINE[selectedClue.category]} {selectedClue.name}
                    </p>
                    <p className="text-xs" style={{ color: '#8a8070' }}>
                      {selectedClue.description}
                    </p>
                    {selectedClue.revelation && (
                      <p className="text-xs mt-2" style={{ color: '#B8960C' }}>
                        🔓 {selectedClue.revelation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {view === 'list' && (
              <div className="space-y-3">
                {/* 按重要度分组 */}
                {(['high', 'medium', 'low'] as const).map((importance) => {
                  const group = clues.filter((c) => c.importance === importance)
                  if (group.length === 0) return null
                  const labels = { high: '🔴 关键线索', medium: '🟡 重要线索', low: '⚪ 一般线索' }
                  return (
                    <div key={importance}>
                      <p
                        className="text-xs font-semibold mb-2 mt-4"
                        style={{ color: '#8a8070' }}
                      >
                        {labels[importance]}
                      </p>
                      <div className="space-y-2">
                        {group.map((clue) => (
                          <ClueCard
                            key={clue.id}
                            clue={clue}
                            isSelected={selectedId === clue.id}
                            isRelated={relatedIds.includes(clue.id)}
                            onClick={() => handleSelect(clue.id)}
                          />
                        ))}
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

const CLUE_CATEGORY_ICONS_INLINE: Record<string, string> = {
  person: '👤',
  object: '🔧',
  location: '📍',
  event: '📅',
  other: '❓',
}