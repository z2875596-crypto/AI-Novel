'use client'

import { useEffect } from 'react'
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

export default function SavesPage() {
  const router = useRouter()
  const { saves, loadFromStorage, remove } = useSaveStore()
  const resetGame = useGameStore((s) => s.resetGame)
  const setMessages = useGameStore((s) => s.setMessages)
  const setGenre = useGenreStore((s) => s.setGenre)
  const setWorldConfig = useWorldStore((s) => s.setWorldConfig)
  const resetSummaries = useSummaryStore((s) => s.reset)

  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])

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
    if (confirm('确定删除这条存档吗？')) {
      remove(id)
    }
  }
  function handleExport(save: SaveRecord) {
    const content = exportNovelAsText(save)
    const filename = `${save.worldConfig.worldName}-${save.worldConfig.protagonistName}.txt`
    downloadText(content, filename)
  }

  return (
    <ThemeProvider>
      <main className="min-h-screen px-4 py-10 max-w-2xl mx-auto" style={{ color: 'var(--theme-text)' }}>
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/')}
            className="text-sm transition-opacity hover:opacity-70"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            ← 主页
          </button>
          <h1
            className="text-xl font-bold"
            style={{ color: 'var(--theme-text)' }}
          >
            存档列表
          </h1>
          <div className="w-16" />
        </div>

        {saves.length === 0 ? (
          <div
            className="text-center py-20"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            <p className="text-4xl mb-4">📭</p>
            <p className="text-sm">还没有存档，去开始一个故事吧！</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-4 py-2 rounded-lg text-sm transition-all hover:brightness-110"
              style={{
                background: 'var(--theme-primary)',
                color: '#fff',
              }}
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
      </main>
    </ThemeProvider>
  )
}