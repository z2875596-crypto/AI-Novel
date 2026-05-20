'use client'

import { useState } from 'react'
import { useGenreStore } from '@/stores/genreStore'
import { GENRE_CONFIG } from '@/lib/themeConfig'

interface Props {
  onQuickSave: () => void
  onSaveAs: (name: string) => void
  onViewSaves: () => void
}

export default function SaveMenu({ onQuickSave, onSaveAs, onViewSaves }: Props) {
  const [showMenu, setShowMenu] = useState(false)
  const [showNameInput, setShowNameInput] = useState(false)
  const [name, setName] = useState('')
  const genre = useGenreStore((s) => s.genre)
  const config = genre ? GENRE_CONFIG[genre] : null

  function handleQuickSave() {
    onQuickSave()
    setShowMenu(false)
  }

  function handleSaveAs() {
    if (!name.trim()) return
    onSaveAs(name.trim())
    setShowNameInput(false)
    setShowMenu(false)
    setName('')
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all hover:brightness-110 active:scale-95"
        style={{
          background: showMenu
            ? `${config?.theme.primary ?? '#888'}22`
            : 'rgba(255,255,255,0.06)',
          color: showMenu ? config?.theme.primary : config?.theme.textMuted,
          border: `1px solid ${showMenu ? (config?.theme.primary ?? '#888') + '66' : config?.theme.border ?? '#333'}`,
        }}
      >
        💾 存档 ▾
      </button>

      {showMenu && !showNameInput && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div
            className="absolute right-0 top-full mt-1.5 w-52 rounded-xl border overflow-hidden z-50 animate-fade-in-up"
            style={{
              background: config?.theme.surface ?? '#1a1a1a',
              borderColor: config?.theme.border ?? '#333',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}
          >
            <button
              onClick={handleQuickSave}
              className="w-full text-left px-4 py-3 transition-all hover:brightness-125 border-b"
              style={{ borderColor: config?.theme.border ?? '#333' }}
            >
              <div className="text-sm font-medium" style={{ color: config?.theme.text ?? '#fff' }}>
                ⚡ 快速保存
              </div>
              <div className="text-xs mt-0.5" style={{ color: config?.theme.textMuted ?? '#888' }}>
                覆盖当前自动存档，继续同一条故事线
              </div>
            </button>

            <button
              onClick={() => setShowNameInput(true)}
              className="w-full text-left px-4 py-3 transition-all hover:brightness-125 border-b"
              style={{ borderColor: config?.theme.border ?? '#333' }}
            >
              <div className="text-sm font-medium" style={{ color: config?.theme.text ?? '#fff' }}>
                📌 另存为…
              </div>
              <div className="text-xs mt-0.5" style={{ color: config?.theme.textMuted ?? '#888' }}>
                创建新存档，保留当前分支，可从不同节点继续
              </div>
            </button>

            <button
              onClick={() => { onViewSaves(); setShowMenu(false) }}
              className="w-full text-left px-4 py-3 transition-all hover:brightness-125"
            >
              <div className="text-sm font-medium" style={{ color: config?.theme.textMuted ?? '#888' }}>
                📂 存档列表
              </div>
              <div className="text-xs mt-0.5" style={{ color: config?.theme.textMuted ?? '#888' }}>
                查看和管理所有存档
              </div>
            </button>
          </div>
        </>
      )}

      {showNameInput && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => { setShowNameInput(false); setShowMenu(false) }}
        >
          <div
            className="w-full max-w-sm mx-4 rounded-2xl border p-6 animate-fade-in-up"
            style={{
              background: config?.theme.surface ?? '#1a1a1a',
              borderColor: config?.theme.border ?? '#333',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-bold mb-1" style={{ color: config?.theme.text ?? '#fff' }}>
              📌 另存为
            </h2>
            <p className="text-xs mb-4" style={{ color: config?.theme.textMuted ?? '#888' }}>
              创建一条独立的新存档，不影响当前自动存档，适合保存关键分支节点
            </p>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveAs()}
              placeholder="为这条分支起个名字…"
              autoFocus
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none mb-4"
              style={{
                background: 'rgba(0,0,0,0.3)',
                borderColor: config?.theme.border ?? '#333',
                color: config?.theme.text ?? '#fff',
              }}
            />

            <div className="flex gap-2">
              <button
                onClick={() => { setShowNameInput(false); setShowMenu(false) }}
                className="flex-1 py-2.5 rounded-xl text-sm transition-all hover:brightness-110"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  color: config?.theme.textMuted ?? '#888',
                  border: `1px solid ${config?.theme.border ?? '#333'}`,
                }}
              >
                取消
              </button>
              <button
                onClick={handleSaveAs}
                disabled={!name.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all hover:brightness-110 disabled:opacity-40"
                style={{
                  background: config?.theme.primary ?? '#888',
                  color: '#fff',
                }}
              >
                保存分支
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}