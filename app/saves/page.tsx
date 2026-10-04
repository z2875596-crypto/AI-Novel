'use client'

import { exportSavesJson } from '@/lib/saveManager'
import { restoreSave } from '@/lib/session'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSaveStore } from '@/stores/saveStore'
import { SaveRecord } from '@/types/save'
import ThemeProvider from '@/components/shared/ThemeProvider'
import SaveCard from '@/components/saves/SaveCard'
import { exportNovelAsText, downloadText } from '@/lib/exportNovel'

export default function SavesPage() {
  const router = useRouter()
  const { saves, loadFromStorage, remove } = useSaveStore()

  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])

  function handleContinue(save: SaveRecord) {
    restoreSave(save)

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

        <p className="text-xs mb-3 opacity-70">存档仅保存在当前浏览器，登录暂不提供云同步。旧存档只恢复其中已有的数据。</p>
        <button className="mb-5 text-sm underline" onClick={() => downloadText(exportSavesJson(), "yuanxu-saves-backup.json")}>导出全部存档备份（JSON）</button>
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